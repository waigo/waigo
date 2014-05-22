"use strict";


var _ = require('lodash');


/**
 * # Development mode configuration
 * 
 * This is the `development` mode configuration for the application.
 * 
 * This configuration module file is optional.
 * 
 * @param  {Object} config Configuration object to modify.
 */
module.exports = function(config) {
  
  // modify errorHandler middleware
  var errorHandlerConfig = _.find(config.middleware, function(f) {
    return 'errorHandler' === f.id;
  })
  if (errorHandlerConfig) {
    errorHandlerConfig.options.showStack = true;
  }


  /**
   * Logging config.
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


