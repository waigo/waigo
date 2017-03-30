


const waigo = global.waigo,
  _ = waigo._


/**
 * Setup middleware common to all requests.
 *
 * @param {Object} App The application.
 */
module.exports = function*(App) {
  App.logger.debug('Setting up common middleware')

  for (const m of App.config.middleware.ALL._order) {
    App.logger.debug(`Loading middleware: ${m}`)

    App.koa.use(waigo.load(`support/middleware/${m}`)(
      App,
      _.get(App.config.middleware.ALL, m, {})
    ))
  }
}
