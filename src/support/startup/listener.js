"use strict";


var debug = require('debug')('waigo-startup-listener'),
  waigo = global.waigo;




/**
 * Start the server HTTP listener.
 *
 * If successful `app.server` will point to the HTTP server object.
 * 
 * _Note: This startup step requires the `logging` startup step to have run 
 * beforehand._
 * 
 * @param {Object} app The application.
 * @param {Integer} app.config.port Port to listen on.
 * @param {String} app.config.baseURL The base URL of the website.
 */
module.exports = function*(app) {
  debug('Starting HTTP server');
  app.logger.info('Server listening in ' + app.config.mode + ' mode on port ' + app.config.port + ' (baseURL: ' + app.config.baseURL + ')');
  app.server = app.listen(app.config.port);
  return app.server;
};

