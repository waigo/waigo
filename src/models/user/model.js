"use strict";

const crypto = require('crypto');

const waigo = global.waigo,
  _ = waigo._,
  Q = waigo.load('support/promise'),
  errors = waigo.load('support/errors'),
  Document = waigo.load('support/models/document'),
  RethinkDbModel = waigo.load('support/models/model').RethinkDbModel,
  adminConfig = waigo.load('models/user/adminConfig'),
  tableDef = waigo.load('models/user/tableDef'),
  docMethods = waigo.load('models/user/docMethods');


const randomBytesQ = Q.promisify(crypto.pseudoRandomBytes);




class Model extends RethinkDbModel {
  constructor (app) {
    super(app, app.db, {
      name: "User",
      schema: tableDef.schema,
      indexes: tableDef.indexes,
      adminConfig: adminConfig,
      docMethods: docMethods,
    });
  }



  /** 
   * Get user by email address.
   * @return {User}
   */
  * getByEmail (email) {
    let ret = yield this._native.filter(function(user) {
      return user('username').eq(email)
        || user('emails')('email').eq(email)
    }).execute();

    return this._wrap(_.get(ret, '0'));
  }


  /**
   * Find all admin users.
   * @return {Array}
   */
  * findAdminUsers () {
    let ret = yield this._native.filter(function(user) {
      return user('roles').contains('admin')
    }).execute();

    return this._wrap(ret);
  }


  /**
   * Get whether any admin users exist.
   * @return {Number}
   */
  * haveAdminUsers () {
    let count = yield this._native.count(function(user) {
      return user('roles').contains('admin')
    }).execute();

    return count > 0;
  }



  /**
   * Generate a secure SHA256 representing given password.
   * @param {String} password The password.
   * @param {String} [salt] Salt to use.
   * @return {String} hash to store
   */
  * generatePasswordHash (password, salt) {
    let hash = crypto.createHash('sha256');

    salt = salt || (yield randomBytesQ(64)).toString('hex');
    hash.update(salt);
    hash.update(password);

    return salt + '-' + hash.digest('hex');
  }



  /**
   * Register a new user
   * @param {Object} properties User props.
   * @param {String} properties.email Email address.
   * @param {String} properties.password Password.
   * @param {Object} properties.roles Roles
   * @return {User} The registered user.
   */
  * register (properties) {
    // create user
    let user = yield this._insert({
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
      throw new Error('Error creating new user: ' + properties.email);
    }

    // log activity
    yield this.app.record('register', user);

    return user;
  }



  * loadLoggedIn (context) {
    let userId = _.get(context, 'session.user.id');

    if (!userId) {
      return null;
    }

    return yield this._get(userId);
  }

}



module.exports = Model;
