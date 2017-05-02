const waigo = global.waigo,
  _ = waigo._,
  DbWrapper = waigo.load('db/support/wrapper')



/**
 * Setup database connections.
 *
 * Upon completion:
 *
 * * `App.dbs` will be consist key-value pairs mapping database connection id to database instance.
 * * `App.db` will be an alias for `App.dbs.main`.
 *
 * @param {Object} App The application.
 */
module.exports = function *(App) {
  const logger = App.logger.create('Db')

  logger.info(`Setting up connections...`)

  App.dbs = {}

  const ids = _.keys(App.config.db || {})

  for (const id of ids) {
    App.logger.debug(`Setting up db: ${id}`)

    const cfg = _.get(App.config.db, id)

    if (!cfg) {
      throw new Error(`Unable to find configuration for database: ${id}`)
    }

    const db = new DbWrapper(App, id, logger.create(id), cfg.type, cfg)

    yield db.init()

    App.dbs[id] = db
  }

  // for convenience
  App.db = _.get(App.dbs, 'main')
}
