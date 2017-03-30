

const path = require('path')

const waigo = global.waigo,
  _ = waigo._,
  logger = waigo.load('support/logger').create('Cron')



/**
 * Setup cron system.
 *
 * @param {Object} app The application.
 */
module.exports = function *(App) {
  App.cron = {}

  const cronTasks = waigo.getItemsInFolder('support/cronTasks')

  logger.info(`${cronTasks.length} cron tasks found`)

  for (const taskFilePath of cronTasks) {
    const name = path.basename(taskFilePath, path.extname(taskFilePath))

    logger.debug(`Adding cron task: ${name}`)

    const job = waigo.load(taskFilePath)

    App.cron[name] = 
      yield App.models.Cron.create(name, job.schedule, job.handler)
  }
}


