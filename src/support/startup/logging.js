"use strict";


var debug = require('debug')('waigo-startup-logging'),
  waigo = require('../../../');


/**
 * Setup application logger.
 *
 * The logging configuration is a key-value map where the key specifies the 
 * name of the module file under the `support.logging` path and the mapped 
 * value specifies the configuration for the specific logger type.
 * 
 * Upon completion `app.logger` will be set.
 *
 * _Note: At present only the first specified logger actually gets initialised_.
 * 
 * @param {Object} app The application.
 * @param {Object} app.config.logging Logger configuration.
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
