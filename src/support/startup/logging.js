"use strict";


var debug = require('debug')('waigo-startup-logging'),
  waigo = require('../../../');


/**
 * Setup application logging.
 *
 * @param {Object} app The application.
 */
module.exports = function*(app) {
  var appLoggerType = Object.keys(app.config.logging).pop();
  
  debug('Setting up logger: ' + appLoggerType);

  app.logger = waigo.load('support/logging/' + appLoggerType).create(app.config.logging[appLoggerType]);

  process.on('uncaughtException', function(err) {
    app.logger.error('Uncaught exception', err.stack);
  });

  app.on('error', function(err, ctx){
    app.logger.error(err.stack);
  });
};
