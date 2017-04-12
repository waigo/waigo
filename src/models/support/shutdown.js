const waigo = global.waigo,
  _ = waigo._



/**
 * Shutdown the models.
 *
 * @param {Object} App The application.
 */
module.exports = function *(App) {
  App.logger.debug('Destroying models')

  yield _.map(App.models || {}, model => model.destroy())
}
