"use strict";

const waigo = global.waigo,
  _ = waigo._;


module.exports = {
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
    
    let generatedHash = yield this.__model.generatePasswordHash(
      password, salt
    );

    return generatedHash === passAuth.token;
  },
  /**
   * Log the user into given context.
   * @param {Object} context waigo client request context.
   */
  login: function*(context) {
    this.__logger.debug(`Logging in user: ${this.id} = ${this.username}`);

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
    this.markChanged('emails');
    yield this.save();

    // record
    this.__app.events.emit('record', 'verify_email', this, {
      email: email
    });
  },
  /**
   * Check whether user has given email address.
   * @param {String} email Email address to check.
   * @return {Boolean}
   */
  hasEmail: function*(email) {
    return 0 <= _.findIndex(this.emails || [], function(e) {
      return email === e.email;
    });
  },
  /**
   * Check whether user has verified given email address.
   * @param {String} email Email address to check.
   * @return {Boolean}
   */
  isEmailVerified: function*(email) {
    let item = _.find(this.emails || [], function(e) {
      return email === e.email;
    });

    return item && item.verified;
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
    this.__app.events.emit('record', 'add_email', this, {
      email: email
    });
  },
  /**
   * Update this user's password.
   * @param {String} newPassword New password.
   */
  updatePassword: function*(newPassword) {
    this.__logger.debug('Update user password', this.username);

    let passAuth = _.find(this.auth, function(a) {
      return 'password' === a.type;
    });

    if (!passAuth) {
      return false;
    }

    // update password
    passAuth.token = yield this.__model.generatePasswordHash(newPassword);

    // save
    this.markChanged('auth');
    yield this.save();

    // record
    this.__app.events.emit('record', 'update_password', this);
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
    this.__logger.debug('Save user auth', this.id, type, data);

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
    this.__app.events.emit('record', 'save_oauth', this, _.pick(existing, 'type', 'access_token'));
  },
  /**
   * Get whether user can access given resource.
   *
   * @param {String} resource      The resource the user wishes to access.
   * 
   * @return {Boolean} true if access is possible, false if not.
   */
  canAccess: function*(resource) {
    return this.__acl.can(resource, this);
  },
  /**
   * Assert that user can access given resource.
   *
   * @param {String} resource The resource the user wishes to access.
   *
   * @throws {Error} If not allowed to access.
   */
  assertAccess: function*(resource) {
    return this.__acl.assert(resource, this);
  },
};
