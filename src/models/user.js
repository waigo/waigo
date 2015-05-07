"use strict";

var crypto = require('crypto'),
  Q = require('bluebird');

var waigo = require('../../'),
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
     * Find the first available admin user.
     * @return {User}
     */
    findAdminUser: function*() {
      return yield this.findOne({
        roles: {
          $in: ['admin']
        }
      });
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
      
      return !!_.intersection( this.roles || [], roles ).length;
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
      context.app.logger.debug('Logging in user', this._id);

      context.session.user = {
        _id: this._id,
        username: this.username
      };

      // update last-login timestamp
      this.lastLogin = new Date();
      yield this.save();
    },
    /**
     * Update this user's password.
     * @param {Object} context waigo client request context.
     * @param {String} newPassword New password.
     */
    updatePassword: function*(context, newPassword) {
      context.app.logger.debug('Update user password', this._id);

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
     * Get whether user can access given resource.
     *
     * @param {String} resource      The resource the user wishes to access.
     * 
     * @return {Boolean} true if access is possible, false if not.
     */
    canAccess: function*(resource) {
      var app = waigo.load('application').app;

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
      var app = waigo.load('application').app;

      return app.acl.assert(resource, this);
    },
  },
};

