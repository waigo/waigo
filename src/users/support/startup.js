const waigo = global.waigo


/**
 * Setup activity recorder for the app.
 *
 * This allows you to record activities to the `Activities` model.
 *
 * This should be preceded by startup: `models`.
 *
 * @param {Object} App The application.
 */
module.exports = function *(App) {
  App.logger.debug('Setting up user management')

  App.users = yield (waigo.load('users')).init(App)
}
