"use strict";

var crypto = require('crypto'),
  Q = require('bluebird');

var waigo = global.waigo,
  _ = waigo._,
  UserError = waigo.load('support/errors').define('UserError');


var randomBytesQ = Q.promisify(crypto.pseudoRandomBytes);



var ProfileSchema = {
  displayName: { type: String, required: true },
};


var EmailSchema = {
  email: { type: String, required: true },
  verified: { type: Boolean },
};


var AuthSchema = {
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
      var hash = crypto.createHash('sha256');

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
      var user = yield this.insert({
        username: properties.email,
        profile: {
          displayName: properties.email,
        },
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
  },
  docMethods: {
    /**
     * Get whether user has any of  given roles
     */
    isOneOf: function() {
      var roles = _.toArray(arguments);
      
      return !! (_.intersection(this.roles || [], roles).length);
    },
    /**
     * Check password against hash.
     * @param {String} password
     * @param {String} storedHash
     * @return {Boolean} true if password matches, false otherwise
     */
    isPasswordCorrect: function*(password) {
      var passAuth = _.find(this.auth, function(a) {
        return 'password' === a.type;
      });

      if (!passAuth) {
        return false;
      }

      var sepPos = passAuth.token.indexOf('-'),
        salt = passAuth.token.substr(0, sepPos),
        hash = passAuth.token.substr(sepPos + 1);
      
      var generatedHash = yield this.__col.generatePasswordHash(
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
      var theEmail = _.find(this.emails, function(e) {
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
     * Update this user's password.
     * @param {String} newPassword New password.
     */
    updatePassword: function*(newPassword) {
      this.getApp().logger.debug('Update user password', this._id);

      var passAuth = _.find(this.auth, function(a) {
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
     * Save OAuth data.
     * @param {String} provider Auth provider.
     * @param {String} token Auth token.
     * @param [Object] data Additional data.
     */
    saveOAuth: function*(provider, token, data) {
      yield this.saveAuth('oauth:' + provider, token, data);
    },
    /**
     * Save Auth data
     * @param {String} type Auth type.
     * @param {String} token Auth token.
     * @param [Object] data Additional data.
     */
    saveAuth: function*(type, token, data) {
      this.getApp().logger.debug('Save user auth', this._id, type, token);

      var existing = _.find(this.auth, function(a) {
        return type === a.type;
      });

      if (!existing) {
        existing = {
          type: type
        };

        this.auth.push(existing);
      }

      existing.token = token;
      existing.data = data;

      // save
      this.markChanged('auth');
      yield this.save();

      // record
      yield this.record('save_auth', this, _.pick(existing, 'type', 'token'));
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

