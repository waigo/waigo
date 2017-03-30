const cluster = require('cluster');

const waigo = global.waigo;




/**
 * Start the server HTTP listener.
 *
 * If successful `App.server` will point to the HTTP server object.
 *
 * @param {Object} App The application.
 */
module.exports = function*(App) {
  App.logger.debug('Starting HTTP server');

  App.server = App.koa.listen(App.config.port);

  const workerInfo = (cluster.worker) ? ` worker: ${cluster.worker.id}` : '';

  const msg = `Server (process:${process.pid} ${workerInfo}) started - listening in ${App.config.mode} mode on port ${App.config.port} (baseURL: ${App.config.baseURL})`;

  App.logger.info(msg);

  App.emit('notify', 'admins', msg);
};
