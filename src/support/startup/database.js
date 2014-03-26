"use strict";


var debug = require('debug')('waigo-startup-database'),
  waigo = require('../../../');



/**
 * Setup database connection.
 *
 * @param {Object} app The application.
 */
module.exports = function*(app) {
  if (app.config.db) {
    var dbType = Object.keys(app.config.db).pop();
    debug('Setting up database connection : ' + dbType);

    var builder = waigo.load('support/db/' + dbType);

    app.db = yield builder.create(app.config.db[dbType]);
  } else {
    app.db = undefined;
  }
};


