"use strict";



/**
 * Shutdown the HTTP server.
 *
 * @param {Object} app The application.
 */
module.exports = function*(app) {
  if (app.server) {
    app.logger.debug('Shutting down HTTP server');

    yield Q.promisify(app.server.close, app.server)();
  } 
};

