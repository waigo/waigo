"use strict";


const waigo = global.waigo,
  _ = waigo._;



/**
 * Shutdown database connection.
 *
 * @param {Object} app The application.
 */
module.exports = function*(app) {
  app.logger.debug('Shutting down database connections');

  let dbAdapters = waigo.getFilesInFolder('support/db');

  yield _.map(dbAdapters, function(adapter) {
    return waigo.load(adapter).closeAll(app.logger);
  });
};


