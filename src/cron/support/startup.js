const path = require('path')

const waigo = global.waigo,
  CronMgr = waigo.load('cron/support/manager')



/**
 * Setup cron system.
 *
 * @param {Object} app The application.
 */
module.exports = function *(App) {
  App.cron = yield CronMgr.init(App)

  const cronTasks = waigo.getItemsInFolder('cron')

  yield cronTasks.map(taskFilePath => {
    const name = path.basename(taskFilePath, path.extname(taskFilePath))

    const job = waigo.load(taskFilePath)

    return App.cron.addJob(name, job)
  })
}
