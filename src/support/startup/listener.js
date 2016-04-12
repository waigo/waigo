"use strict";


const cluster = require('cluster');

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

  let workerInfo = (cluster.worker) ? ` worker: ${cluster.worker.id}` : '';

  let msg = `Server (process:${process.pid} ${workerInfo}) started - listening in ${app.config.mode} mode on port ${app.config.port} (baseURL: ${app.config.baseURL})`;

  app.logger.info(msg);

  app.events.emit('notify', 'admins', msg);
};




