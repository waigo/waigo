"use strict";


var waigo = require('../../'),
  _ = waigo._;



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
  config.middleware.ALL.errorHandler.showStack = true;
  config.middleware.ALL.outputFormats.formats.html.cache = false;
  config.logging.minLevel = 'DEBUG';
  // emails get printed to console
  config.mailer.type = 'console';
};
