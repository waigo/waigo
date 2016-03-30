"use strict";

const crypto = require('crypto');

const waigo = global.waigo,
  _ = waigo._,
  errors = waigo.load('support/errors');


const ActionTokensError = exports.ActionTokensError = errors.define('ActionTokensError');


const _throw = function(msg, status, data) {
  throw new ActionTokensError(msg, status, data);
};


class ActionTokens {
  constructor (app, config) {
    this.app = app;
    this.config = config;

    this.logger = app.logger.create('ActionTokens');

    this.logger.debug(`encryption key is: ${this.config.encryptionKey}`);
  }


  /**
   * Create a token representing the given action.
   *
   * @param {String} type email action type.
   * @param {User} user User this action is for. 
   * @param {Object} [data] Additional data to associate with this action (must be JSON-stringify-able)
   * @param {Object} [options] Additional options.
   * @param {Number} [options.validForHours] Override default `validForHours` settings with this.
   *
   * @return {String} the action token. 
   */
  * create (type, user, data, options) {
    data = data || '';

    options = _.extend({
      validForHours: this.config.validForHours
    }, options);

    this.logger.debug(`Creating action token: ${type} for user ${user.id}`, data);

    // every token is uniquely identied by a salt (this is also doubles up as  
    // a factor for more secure encryption)
    let salt = _.uuid.v4();

    let plaintext = JSON.stringify([ 
      Date.now() + (options.validForHours * 1000 * 60 * 60), 
      salt, 
      type, 
      user.id, 
      data 
    ]);

    this.logger.trace('Encrypt: ' + plaintext);

    let cipher = crypto.createCipher(
      'aes256', this.config.encryptionKey
    );

    return cipher.update(plaintext, 'utf8', 'hex') + cipher.final('hex');
  }

  /** 
   * Process the given action token.
   *
   * Note: A given token can only be processed once.
   * 
   * @param {String} token the token to process.
   * @param {Object} [options] Additional options.
   * @param {String} [options.type] Expected token type.
   * 
   * @param {Object} token `type`, `user` and `data`.
   */
  * process (token, options) {
    options = options || {};
    
    this.logger.debug(`Processing action token: ${token}`);

    let json = null;

    try {
      let decipher = crypto.createDecipher(
        'aes256', this.config.encryptionKey
      );

      let plaintext = decipher.update(token, 'hex', 'utf8') 
        + decipher.final('utf8');

      this.logger.trace(`Decrypted: ${plaintext}`);

      json = JSON.parse(plaintext);
    } catch (err) {
      _throw('Error parsing action token', 400, {
        error: err.stack
      });
    }

    let ts = json[0],
      salt = json[1],
      type = json[2],
      userId = json[3],
      data = json[4];

    if (!_.isEmpty(options.type) && type !== options.type) {
      _throw(`Action token type mismatch: ${type}`, 400);
    }

    // check if action still valid
    if (Date.now() > ts) {
      _throw('This action token has expired.', 403);
    }

    var user = yield this.app.models.User.getById(userId);

    if (!user) {
      _throw('Unable to find user information related to action token', 404);
    }

    // check if we've already executed this request before
    var activity = yield this.app.models.Activity.getByFilter({
      type: type, 
      'details.salt': salt
    });

    if (activity.length) {
      _throw('This action token has already been processed and is no longer valid.', 403);
    }

    // record activity
    yield this.app.record('action_token_processed', user, {
      type: type,
      salt: salt,
    });

    this.logger.debug(`Action token processed: ${token}`);

    return {
      type: type,
      user: user,
      data: data,
    };
  }  

}





/**
 * Initialise action tokens manager.
 *
 * @param {App} app The app.
 * @param {Object} actionTokensConfig Config.
 * 
 * @return {ActionTokens}
 */
exports.init = function*(app, actionTokensConfig) {
  return new ActionTokens(app, actionTokensConfig);
};



