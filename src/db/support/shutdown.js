const waigo = global.waigo,
  _ = waigo._




/**
 * Shutdown database connections.
 *
 * @param {Object} App The application.
 */
module.exports = function *(App) {
  App.logger.debug('Shutting down database connections')

  yield _.map(App.dbs || {}, db => db.disconnect())
}
