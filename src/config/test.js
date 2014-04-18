"use strict";


/**
 * # Test mode configuration
 * 
 * This is the `test` mode configuration for the application.
 * 
 * This configuration module file is optional.
 * 
 * @param  {Object} config Configuration object to modify.
 */
module.exports = function(config) {
  /**
   * Configuration for request error handler.
   */
  config.errorHandler = {
    showStack: true
  };


  /**
   * Logging configuration.
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
