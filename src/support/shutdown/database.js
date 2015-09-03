"use strict";


var debug = require('debug')('waigo-shutdown-database'),
  waigo = global.waigo;



/**
 * Shutdown database connection.
 *
 * @param {Object} app The application.
 */
module.exports = function*(app) {
  debug('Shutting down database connections');

  var dbAdapters = waigo.getModulesInPath('support/db');

  yield Promise.map(dbAdapters, function(adapter) {
    yield Promise.coroutine(waigo.load(adapter).closeAll)();
  });
};


