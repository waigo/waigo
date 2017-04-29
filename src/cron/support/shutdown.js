/**
 * Stop cron jobs.
 *
 * @param {Object} App The application.
 */
module.exports = function *(App) {
  if (App.cron) {
    yield App.cron.destroy()
  }
}
