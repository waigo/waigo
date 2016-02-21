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
  let logger = app.logger.create('Cron');
  
  app.cron = {};

  let cronTasks = waigo.getFilesInFolder('support/cronTasks');

  logger.info(`${cronTasks.length} cron tasks found`);

  for (let taskFilePath of cronTasks) {
    let name = path.basename(taskFilePath, path.extname(taskFilePath));

    logger.debug(`Adding cron task: ${name}`);

    let job = waigo.load(taskFilePath);

    app.cron[name] = 
      yield app.models.Cron.create(name, job.schedule, job.handler);
  }
};


