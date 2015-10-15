"use strict";


var debug = require('debug')('waigo-shutdown-database'),
  waigo = global.waigo,
  _ = waigo._;



/**
 * Shutdown database connection.
 *
 * @param {Object} app The application.
 */
module.exports = function*(app) {
  debug('Shutting down database connections');

  var dbAdapters = waigo.getFilesInFolder('support/db');

  yield _.map(dbAdapters, function(adapter) {
    return waigo.load(adapter).closeAll();
  });
};


