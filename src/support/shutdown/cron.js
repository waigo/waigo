


const waigo = global.waigo,
  _ = waigo._



/**
 * Stop cron jobs.
 *
 * @param {Object} App The application.
 */
module.exports = function*(App) {
  App.logger.debug('Stopping cron jobs')

  _.map(App.cron, function(job) {
    job.stopScheduler()
  })
}


