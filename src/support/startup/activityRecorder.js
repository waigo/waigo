

const co = require('co')

const waigo = global.waigo,
  _ = waigo._



/**
 * Setup activity recorder for the app.
 *
 * This allows you to record activities to the `Activities` model.
 * 
 * This should be preceded by startup: `models`.
 *
 * @param {Object} App The application.
 */
module.exports = function*(App) {
  App.logger.debug('Setting up Activity recording')

  App.on('record', co.wrap(function*() {
    yield App.models.Activity.record.apply(App.models.Activity, arguments)
  }))
}

