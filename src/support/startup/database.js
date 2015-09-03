"use strict";


var waigo = global.waigo,
  _ = waigo._;



/**
 * Setup database connection.
 *
 * Upon completion:
 * 
 * * `app.dbs` will be consist key-value pairs mapping database connection id to database instance.
 * * `app.db` will be an alias for `app.dbs.main`.
 * 
 * @param {Object} app The application.
 * @param {Object} [app.config.db] Database configuration.
 */
module.exports = function*(app) {
  app.dbs = {};

  var ids = _.keys(app.config.db || {});

  for (let i=0; ids.length > i; ++i) {
    let id = ids[i],
      cfg = app.config.db[id];

    app.logger.debug('Setting up database connection: ' + id);
    
    var builder = waigo.load('support/db/' + cfg.type);

    app.dbs[id] = yield builder.create(cfg);
  }

  // for convenience
  app.db = app.dbs.main;
};


