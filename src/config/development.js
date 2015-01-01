"use strict";



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
  
  config.middleware.options.errorHandler = {
    showStack: true
  }


  config.logging = {
    // minimum logging level
    minLevel: 'DEBUG',
  };

};
