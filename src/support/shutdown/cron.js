"use strict";


const waigo = global.waigo,
  _ = waigo._;



/**
 * Stop cron jobs.
 *
 * @param {Object} app The application.
 */
module.exports = function*(app) {
  app.logger.debug('Stopping cron jobs');

  _.map(app.cron, function(job) {
    job.stopScheduler();
  });
};


