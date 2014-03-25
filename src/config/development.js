/**
 * # Configuration for 'development' mode
 *
 * This file contains configuration which gets loaded when node is running in `development` mode. It overrides the 
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
    db: 'waigo-dev'
  }
};



/**
 * Config for request error handler.
 * @type {Object}
 */
exports.errorHandler = {
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
      // minimum level to log at
      level: 'info',
      colorize: true,
      timestamp: true
    }
  }
};



