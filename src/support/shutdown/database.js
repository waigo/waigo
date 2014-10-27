"use strict";


var debug = require('debug')('waigo-shutdown-database'),
  waigo = require('../../../');



/**
 * Shutdown database connection.
 *
 * @param {Object} app The application.
 */
module.exports = function*(app) {
  if (app.config.db) {
    var dbType = Object.keys(app.config.db).pop();
    debug('Shutting down database connection : ' + dbType);

    var builder = waigo.load('support/db/' + dbType);

    yield builder.shutdown(app.db);
  }
};


