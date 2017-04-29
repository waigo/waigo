const waigo = global.waigo


/**
 * Setup action tokens interface and request processor.
 *
 * @param {Object} App The application.
 */
module.exports = function *(App) {
  App.logger.debug('Setting up action tokens system')

  const actionTokens = waigo.load('actionTokens')

  App.actionTokens = yield actionTokens.init(
    App, App.config.actionTokens
  )
}
