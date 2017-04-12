const co = require('co')

const waigo = global.waigo



/**
 * Setup activity recorder for the app.
 *
 * @param {Object} App The application.
 */
module.exports = function *(App) {
  App.logger.info('Setting up Activity recorder')

  App.activity = yield (waigo.load('activityRecorder')).init()

  App.on('record', co.wrap(function *() {
    yield App.activity.record.apply(App.activity, arguments)
  }))
}
