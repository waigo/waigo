"use strict";


var debug = require('debug')('waigo-startup-listener'),
  waigo = require('../../../');


/**
 * # Startup: HTTP listener
 *
 * Note: This startup step requires the `logging` startup step to have run beforehand.
 *
 * This step initialises the koa HTTP listener on the configured port.
 */




/**
 * Start the server listener.
 *
 * If successful `app.server` will point to the HTTP server object.
 * 
 * @param {Object} app The application.
 */
module.exports = function*(app) {
  debug('Starting HTTP server');
  app.logger.info('Server listening in ' + app.config.mode + ' mode on port ' + app.config.port + ' (baseURL: ' + app.config.baseURL + ')');
  app.server = app.listen(app.config.port);
  return app.server;
};

