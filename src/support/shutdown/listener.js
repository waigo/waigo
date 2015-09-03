"use strict";


var debug = require('debug')('waigo-shutdown-listener'),
  Q = require('bluebird'),
  waigo = global.waigo;



/**
 * Shutdown the HTTP server.
 *
 * @param {Object} app The application.
 */
module.exports = function*(app) {
  if (app.server) {
    debug('Shutting down HTTP server');
    
    yield Q.promisify(app.server.close, app.server)();
  } 
};

