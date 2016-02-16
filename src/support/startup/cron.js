"use strict";

const path = require('path');

const waigo = global.waigo,
  _ = waigo._;



/**
 * Setup cron system.
 *
 * @param {Object} app The application.
 */
module.exports = function*(app) {
  logger.info(`Setting up cron`);

  let logger = app.logger.create('Cron');
  
  app.cron = {};

  let cronTasks = waigo.getFilesInFolder('support/cronTasks');

  logger.info(`${cronTasks.length} cron tasks found`);

  for (modulePath of cronTasks) {
    let name = path.basename(modulePath, path.extname(modulePath));

    logger.debug(`Adding cron task: ${name}`);

    let job = waigo.load(modulePath);

    app.cron[name] = 
      yield app.models.Cron.create(name, job.schedule, job.handler);
  }
};


