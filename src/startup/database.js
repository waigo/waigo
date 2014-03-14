"use strict";


var debug = require('debug')('waigo-startup-database'),
  waigo = require('../../');



/**
 * Setup database connection.
 *
 * @param {Object} app The application.
 */
module.exports = function*(app) {
  if (app.config.db) {
    var dbType = Object.keys(app.config.db).pop();
    debug('Setting up database connection : ' + dbType);
    app.db = waigo.load('support/db/' + dbType).create(app.config.db[dbType]);
  }
};


