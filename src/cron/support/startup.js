const path = require('path')

const waigo = global.waigo,
  logger = waigo.load('logger').create('Cron')



/**
 * Setup cron system.
 *
 * @param {Object} app The application.
 */
module.exports = function *(App) {
  const dbModel = yield this.App.db.model('cron', CronDbModel)

  App.cron = {}

  const cronTasks = waigo.getItemsInFolder('cron')

  logger.info(`${cronTasks.length} cron tasks found`)

  for (const taskFilePath of cronTasks) {
    const name = path.basename(taskFilePath, path.extname(taskFilePath))

    logger.debug(`Adding cron task: ${name}`)

    const job = waigo.load(taskFilePath)

    App.cron[name] =
      yield App.models.Cron.create(name, job.schedule, job.handler)
  }
}
