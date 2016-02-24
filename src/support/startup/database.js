"use strict";


const waigo = global.waigo,
  _ = waigo._;



/**
 * Setup database connections.
 *
 * Upon completion:
 * 
 * * `app.dbs` will be consist key-value pairs mapping database connection id to database instance.
 * * `app.db` will be an alias for `app.dbs.main`.
 * 
 * @param {Object} app The application.
 */
module.exports = function*(app) {
  app.logger.info(`Setting up database connections`);

  app.dbs = {};

  let ids = _.keys(app.config.db || {});

  for (let id of ids) {
    app.logger.debug(`Setting up db: ${id}`);

    let cfg = _.get(app.config.db, id);

    if (!cfg) {
      throw new Error(`Unable to find configuration for database: ${id}`);
    }
    
    let builder = waigo.load(`support/db/${cfg.type}`);

    app.dbs[id] = yield builder.create(app.logger.create(id), cfg);
  }

  // for convenience
  app.db = _.get(app.dbs, 'main');
};


