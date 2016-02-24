"use strict";

const crypto = require('crypto');

const waigo = global.waigo,
  _ = waigo._,
  Q = waigo.load('support/promise'),
  errors = waigo.load('support/errors');

const UserError = errors.define('UserError');

const randomBytesQ = Q.promisify(crypto.pseudoRandomBytes);


function buildModelMethods(app) {
  return {
    /**
     * Find all admin users.
     * @return {Array}
     */
    findAdminUsers: function*() {
      return yield this.filter(function(user) {
        return user('roles').contains('admin')
      }).run();
    },
    /**
     * Get whether any admin users exist.
     * @return {Array}
     */
    haveAdminUsers: function*() {
      return (yield this.count(function(user) {
        return user('roles').contains('admin')
      }).run()) > 0;
    },
    /**
     * Generate a secure SHA256 representing given password.
     * @param {String} password The password.
     * @param {String} [salt] Salt to use.
     * @return {String} hash to store
     */
    generatePasswordHash: function*(password, salt) {
      let hash = crypto.createHash('sha256');

      salt = salt || (yield randomBytesQ(64)).toString('hex');
      hash.update(salt);
      hash.update(password);

      return salt + '-' + hash.digest('hex');
    },
    /**
     * Register a new user
     * @param {Object} properties User props.
     * @param {String} properties.email Email address.
     * @param {String} properties.password Password.
     * @param {Object} properties.roles Roles
     * @return {User} The registered user.
     */
    register: function*(properties) {
      // create user
      let user = yield this.save({
        username: properties.email,
        profile: _.extend({
          displayName: properties.email,
        }, properties.profile),
        emails: [
          {
            email: properties.email,
            verified: false,
          }
        ],
        auth: [
          {
            type: 'password',
            token: yield this.generatePasswordHash(properties.password),
          }
        ],
        roles: properties.roles,
      });

      if (!user) {
        throw new UserError('Error creating new user: ' + properties.email);
      }

      // log activity
      yield app.record('register', user);

      return user;
    },
    loadLoggedIn: function*(context) {
      let userId = _.get(context, 'session.user.id');

      if (!userId) {
        return null;
      }

      let res = yield this.filter({ id: userId }).run();

      return _.get(res, '0');
    },
  };
}



function buildDocMethods(app) {
  return {
    /**
     * Get whether user has any of  given roles
     */
    isOneOf: function() {
      let roles = _.toArray(arguments);
      
      return !! (_.intersection(this.roles || [], roles).length);
    },
    /**
     * Check password against hash.
     * @param {String} password
     * @param {String} storedHash
     * @return {Boolean} true if password matches, false otherwise
     */
    isPasswordCorrect: function*(password) {
      let passAuth = _.find(this.auth, function(a) {
        return 'password' === a.type;
      });

      if (!passAuth) {
        return false;
      }

      let sepPos = passAuth.token.indexOf('-'),
        salt = passAuth.token.substr(0, sepPos),
        hash = passAuth.token.substr(sepPos + 1);
      
      let generatedHash = yield this.getModel().generatePasswordHash(
        password, salt
      );

      return generatedHash === passAuth.token;
    },
    /**
     * Log the user into given context.
     * @param {Object} context waigo client request context.
     */
    login: function*(context) {
      app.logger.debug('Logging in user', this.id);

      context.session.user = {
        id: this.id,
        username: this.username,
      };

      // update last-login timestamp
      this.lastLogin = new Date();
      yield this.save();
    },
    /**
     * Verify an email address.
     * @param {String} email Email address to verify.
     */
    verifyEmail: function*(email) {
      let theEmail = _.find(this.emails, function(e) {
        return email === e.email;
      });

      if (!theEmail) {
        return false;
      }

      theEmail.verified = true;

      // save
      yield this.save();

      // record
      yield app.record('verify_email', this, {
        email: email
      });
    },
    /**
     * Add an email address.
     * @param {String} email Email address to verify.
     * @param {Boolea} verified Whether address is verified.
     */
    addEmail: function*(email, verified) {
      let theEmail = _.find(this.emails, function(e) {
        return email === e.email;
      });

      if (!theEmail) {
        theEmail = {
          email: email,
        };

        this.emails.push(theEmail);
      }

      theEmail.verified = true;

      // save
      yield this.save();

      // record
      yield app.record('add_email', this, {
        email: email
      });
    },
    /**
     * Update this user's password.
     * @param {String} newPassword New password.
     */
    updatePassword: function*(newPassword) {
      app.logger.debug('Update user password', this.id);

      let passAuth = _.find(this.auth, function(a) {
        return 'password' === a.type;
      });

      if (!passAuth) {
        return false;
      }

      // update password
      passAuth.token = yield this.getModel().generatePasswordHash(newPassword);

      // save
      yield this.save();

      // record
      yield app.record('update_password', this);
    },
    /**
     * Get OAuth data.
     * 
     * @param {String} provider Auth provider.
     *
     * @return {Object} null if not found.
     */
    getOauth: function(provider)  {
      provider = 'oauth:' + provider;
      
      provider = _.find(this.auth, function(a) {
        return provider === a.type;
      });

      return _.get(provider, 'data', null);
    },
    /**
     * Save OAuth data.
     * 
     * @param {String} provider Auth provider.
     * @param {Object} data Data.
     */
    saveOAuth: function*(provider, data) {
      yield this.saveAuth('oauth:' + provider, data);
    },
    /**
     * Save Auth data.
     * 
     * @param {String} type Auth type.
     * @param {Object} data Data.
     */
    saveAuth: function*(type, data) {
      app.logger.debug('Save user auth', this.id, type);

      let existing = _.find(this.auth, function(a) {
        return type === a.type;
      });

      if (!existing) {
        existing = {
          type: type
        };

        this.auth.push(existing);
      }

      existing.data = data;

      // save
      yield this.save();

      // record
      yield app.record('save_oauth', this, _.pick(existing, 'type', 'token'));
    },
    /**
     * Get whether user can access given resource.
     *
     * @param {String} resource      The resource the user wishes to access.
     * 
     * @return {Boolean} true if access is possible, false if not.
     */
    canAccess: function*(resource) {
      return app.acl.can(resource, this);
    },
    /**
     * Assert that user can access given resource.
     *
     * @param {String} resource The resource the user wishes to access.
     *
     * @throws {Error} If not allowed to access.
     */
    assertAccess: function*(resource) {
      return app.acl.assert(resource, this);
    },
  };
}




module.exports = function(app) {
  const db = app.db;

  const User = db.createModel("User", {
    username: db.type.string().required(),
    profile: {
      displayName: db.type.string().required(),
    },
    emails: db.type.array().required().schema({
      email: db.type.string().required(),
      verified: db.type.boolean().optional(),
    }),
    auth: db.type.array().required().schema({
      type: db.type.string().required(),
      token: db.type.string().required(),
      data: db.type.object().optional().allowExtra(),
    }),
    roles: db.type.array().required().schema(db.type.string()),
    lastLogin: db.type.date().optional(),
  }, {
    enforce_missing: true
  });

  User.admin = {
    listView: ['verb', 'actor', 'published'],
  };

  _.each(buildModelMethods(app), function(fn, k) {
    User[k] = _.bind(fn, User);
  });

  _.each(buildDocMethods(app), function(fn, k) {
    User.define(k, fn);
  });

  User.ensureIndex('username');
  User.ensureIndex('email', function(doc) {
    return doc('emails')('email');
  }, {
    multi: true,
  });
  User.ensureIndex('roles', undefined, {
    multi: true,
  });

  return User;
};

