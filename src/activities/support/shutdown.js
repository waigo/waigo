/**
 * Shutdown activity recorder.
 *
 * @param {Object} App The application.
 */
module.exports = function *(App) {
  App.logger.debug('Shutting down Activity recording')

  App.removeAllListeners('record')
}
