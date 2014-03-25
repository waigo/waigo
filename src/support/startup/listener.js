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
 * @param {Object} app The application.
 */
module.exports = function*(app) {
  debug('Starting HTTP server');
  app.logger.info('Server listening in ' + app.config.mode + ' mode on port ' + app.config.port + ' (baseURL: ' + app.config.baseURL + ')');
  return app.listen(app.config.port);
};

