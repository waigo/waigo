

const waigo = global.waigo,
  Q = waigo.load('support/promise')



/**
 * Shutdown the HTTP server.
 *
 * @param {Object} App The application.
 */
module.exports = function*(App) {
  if (App.server) {
    App.logger.debug('Shutting down HTTP server')

    yield Q.promisify(App.server.close, {
      context: App.server
    })()
  }
}
