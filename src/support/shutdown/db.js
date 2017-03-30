


const waigo = global.waigo,
  _ = waigo._;




/**
 * Shutdown database connections.
 *
 * @param {Object} App The application.
 */
module.exports = function*(App) {
  App.logger.debug('Shutting down database connections');

  let dbAdapters = waigo.getItemsInFolder('support/db');

  yield _.map(dbAdapters, function(adapter) {
    return waigo.load(adapter).closeAll(App.logger);
  });
};


