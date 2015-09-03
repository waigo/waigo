"use strict";

var path = require('path');

var waigo = global.waigo,
  _ = waigo._;



/**
 * Setup cron jobs.
 */
module.exports = function*(app) {
  var logger = app.logger.create('Cron');
  
  app.cron = {};

  var cronTasks = waigo.getFilesInFolder('support/cronTasks');

  logger.info('Setting up cron: ' + cronTasks.length + ' tasks');

  for (let i=0; cronTasks.length > i; ++i) {
    let modulePath = cronTasks[i];

    var name = path.basename(modulePath, path.extname(modulePath));

    logger.debug('Adding cron task: ' + name);

    var job = waigo.load(modulePath);

    app.cron[name] = yield app.models.Cron.create(name, job.schedule, job.handler);
  }
};


