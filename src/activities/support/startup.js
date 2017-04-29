const co = require('co')

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
  App.logger.debug('Setting up Activity recording')

  const Activities = waigo.load('activities')

  App.activities = yield Activities.init(App)

  App.on('record', co.wrap(function *() {
    App.activities.record(arguments)
  }))
}
