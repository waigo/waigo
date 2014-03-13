/**
 * # Configuration for 'test' mode
 *
 * This file contains configuration which gets loaded when node is running in `test` mode. It overrides the 
 * [base configuration](base.js.html).
 */


/**
 * Database connection.
 * @type {Object}
 */
exports.db = {
  mongoose: {
    host: '127.0.0.1',
    port: '27017',
    db: 'waigo-test'
  }
};



/**
 * Config for request error handler.
 * @type {Object}
 */
exports._errorHandler = {
  showStack: true
};



/**
 * Logging config.
 * @type {Object}
 */
exports.logging = {
  winston: {
    // log to console
    console: {
      level: 'debug',
      colorize: true,
      timestamp: true
    }
  }
};


