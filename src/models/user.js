"use strict";

const crypto = require('crypto');

const waigo = global.waigo,
  _ = waigo._,
  errors = waigo.load('support/errors');

const UserError = errors.define('UserError');


function randomBytesQ(numBytes) {
  return new Promise((resolve, reject) => {
    crypto.pseudoRandomBytes(numBytes, (err, val) => {
      if (err) {
        reject(err)
      } else {
        resolve(val);
      }
    });
  });
}


const ProfileSchema = {
  displayName: { type: String, required: true },
};


const EmailSchema = {
  email: { type: String, required: true },
  verified: { type: Boolean },
};


const AuthSchema = {
  type: { type: String, required: true },
  token: { type: String, required: true },
  data: { type: Object },
}


module.exports = {
  schema: {
    username: { 
      type: String, 
      required: true,
    },
    profile: { 
      type: ProfileSchema, 
      required: true,
    },
    emails: { 
      type: [EmailSchema],
      required: true,
    },
    auth: { 
      type: [AuthSchema], 
      required: true,
    },
    roles: { 
      type: [String], 
      required: false,
    },
    lastLogin: { 
      type: Date, 
      required: false,
    },
  },
  admin: {
    listView: [
      'username',
      {
        name: 'emails',
        subKey: 'email'
      },
      {
        name: 'roles',
      },
      'lastLogin'
    ]
  },
  indexes: [
    // username
    {
      fields: {
        username: 1
      }, 
      options: {
        unique: true
      }
    },
    // emails
    {
      fields: {
        'emails.email': 1
      },
      options: {
        unique: true
      }
    },
    // roles
    {
      fields: {
        roles: 1
      }
    },
  ],
  methods: {
    /**
     * Find all admin users.
     * @return {Array}
     */
    findAdminUsers: function*() {
      return yield this.find({
        roles: {
          $in: ['admin']
        }
      });
    },
    /**
     * Get whether any admin users exist.
     * @return {Array}
     */
    haveAdminUsers: function*() {
      return (yield this.find({
        roles: {
          $in: ['admin']
        }
      })).length > 0;
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
      let user = yield this.insert({
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
      yield this.record('register', user);

      return user;
    },
    loadLoggedIn: function*(context) {
      let userId = _.get(context, 'session.user._id');

      if (!userId) {
        return null;
      }

      return yield this.findOne({
        _id: userId,
      });
    },
  },
  docMethods: {
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
      
      let generatedHash = yield this.__col.generatePasswordHash(
        password, salt
      );

      return generatedHash === passAuth.token;
    },
    /**
     * Log the user into given context.
     * @param {Object} context waigo client request context.
     */
    login: function*(context) {
      this.getApp().logger.debug('Logging in user', this._id);

      context.session.user = {
        _id: this._id,
        username: this.username
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
      this.markChanged('emails');
      yield this.save();

      // record
      yield this.record('verify_email', this, {
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
      this.markChanged('emails');
      yield this.save();

      // record
      yield this.record('add_email', this, {
        email: email
      });
    },
    /**
     * Update this user's password.
     * @param {String} newPassword New password.
     */
    updatePassword: function*(newPassword) {
      this.getApp().logger.debug('Update user password', this._id);

      let passAuth = _.find(this.auth, function(a) {
        return 'password' === a.type;
      });

      if (!passAuth) {
        return false;
      }

      // update password
      passAuth.token = yield this.__col.generatePasswordHash(newPassword);

      // save
      this.markChanged('auth');
      yield this.save();

      // record
      yield this.record('update_password', this);
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
      this.getApp().logger.debug('Save user auth', this._id, type);

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
      this.markChanged('auth');
      yield this.save();

      // record
      yield this.record('save_oauth', this, _.pick(existing, 'type', 'token'));
    },
    /**
     * Get whether user can access given resource.
     *
     * @param {String} resource      The resource the user wishes to access.
     * 
     * @return {Boolean} true if access is possible, false if not.
     */
    canAccess: function*(resource) {
      return this.getApp().acl.can(resource, this);
    },
    /**
     * Assert that user can access given resource.
     *
     * @param {String} resource The resource the user wishes to access.
     *
     * @throws {Error} If not allowed to access.
     */
    assertAccess: function*(resource) {
      return this.getApp().acl.assert(resource, this);
    },
  },
};

