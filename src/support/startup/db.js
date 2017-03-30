


const waigo = global.waigo,
  _ = waigo._;



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
module.exports = function*(App) {
  App.logger.info(`Setting up database connections`);

  App.dbs = {};

  let ids = _.keys(App.config.db || {});

  for (const id of ids) {
    App.logger.debug(`Setting up db: ${id}`);

    let cfg = _.get(App.config.db, id);

    if (!cfg) {
      throw new Error(`Unable to find configuration for database: ${id}`);
    }
    
    let builder = waigo.load(`support/db/${cfg.type}`);

    App.dbs[id] = yield builder.create(id, App.logger.create(id), cfg);
  }

  // for convenience
  App.db = _.get(App.dbs, 'main');
};


