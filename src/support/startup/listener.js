"use strict";


const waigo = global.waigo;




/**
 * Start the server HTTP listener.
 *
 * If successful `app.server` will point to the HTTP server object.
 * 
 * @param {Object} app The application.
 */
module.exports = function*(app) {
  app.logger.debug('Starting HTTP server');

  app.server = app.listen(app.config.port);

  app.logger.info(`Server listening in ${app.config.mode} mode on port ${app.config.port} (baseURL: ${app.config.baseURL})`);
};

