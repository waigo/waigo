const waigo = global.waigo


/**
 * Setup action tokens interface and request processor.
 *
 * @param {Object} App The application.
 */
module.exports = function *(App) {
  App.logger.debug('Setting up action tokens system')

  const mod = waigo.load('actionTokens')

  App.actionTokens = yield mod.init(
    App, App.config.actionTokens
  )
}
