"use strict";

const waigo = global.waigo,
  Q = waigo.load('support/promise');



/**
 * Shutdown the HTTP server.
 *
 * @param {Object} app The application.
 */
module.exports = function*(app) {
  if (app.server) {
    app.logger.debug('Shutting down HTTP server');

    yield Q.promisify(app.server.close, {
      context: app.server
    })();
  } 
};

