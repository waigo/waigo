/**
 * # Configuration for 'test' mode
 *
 * This file contains configuration which gets loaded when node is running in `test` mode. It overrides the 
 * [base configuration](base.js.html).
 */


/**
 * Get configuration.
 * 
 * @param  {Object} config Configuration object to modify.
 */
module.exports = function(config) {

  /**
   * Config for request error handler.
   * @type {Object}
   */
  config.errorHandler = {
    showStack: true
  };


  /**
   * Logging config.
   * @type {Object}
   */
  config.logging = {
    winston: {
      // log to console
      console: {
        // minimum level to log at
        level: 'debug',
        colorize: true,
        timestamp: true
      }
    }
  };


};

