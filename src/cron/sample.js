/**
 * @fileOverview
 *
 * Dummy cron job
 */

exports.schedule = '0 0 3 * * 1'   // every monday morning at 3am

exports.handler = function *(App) {
  App.logger.info('Sample cron job running')
}
