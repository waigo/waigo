"use strict";



/**
 * Shutdown the HTTP server.
 *
 * @param {Object} app The application.
 */
module.exports = function*(app) {
  if (app.server) {
    app.logger.debug('Shutting down HTTP server');

    yield new Promise(function(resolve, reject) {
      app.server.close(function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      })
    });
  } 
};

