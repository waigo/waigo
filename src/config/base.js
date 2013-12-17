/**
 * Base configuration
 */


/**
 * Server listening port.
 * @type {Number}
 */
exports.port = 3000;


/**
 * Base web URL
 * @type {String}
 */
exports.baseURL = 'http://localhost:' + exports.port;


/**
 * Db connection
 * @type {Object}
 */
exports.db = {
  mongoskin: {
    host: '127.0.0.1',
    port: '27017',
    db: 'waigo'
  }
};


/**
 * Logging config.
 * @type {Object}
 */
exports.logging = {
  winston: {
    mongo: {
      level: 'error',
      collection: 'logs',
      safe: false
    }
  }
};


/**
 * Session secret key.
 * @type {String}
 */
//exports.sessionSecret = ;


/**
 * Static resources.
 * @type {String}
 */
exports.staticFolder = __dirname + '/../public';


/**
 * Single-file upload size limit (MB).
 * @type {Number}
 */
exports.uploadLimitMb = 10;

/**
 * No. of days a user session stays valid for.
 * @type {Number}
 */
exports.sessionValidDays = 7;

/**
 * Name of access control model.
 * @type {String}
 */
exports.accessControlModel = 'Account';


/**
 * Config for error handler.
 * @type {Object}
 */
exports.errorHandlerConfig = {
  dumpExceptions: false,
  showStack: false
};
