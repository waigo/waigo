

const co = require('co')

const waigo = global.waigo,
  _ = waigo._



/**
 * Setup activity recorder for the app.
 *
 * @param {Object} App The application.
 */
module.exports = function *(App) {
  App.logger.info('Setting up Activity recorder')

  const activityRecorder = yield (waigo.load('activityRecorder')).init()

  App.on('record', co.wrap(function *() {
    yield activityRecorder.record.apply(activityRecorder, arguments)
  }))
}
