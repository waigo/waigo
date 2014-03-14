"use strict";


var debug = require('debug')('waigo-startup-cookies'),
  waigo = require('../../');



/**
 * Setup cookies.
 *
 * @param {Object} app The application.
 */
module.exports = function*(app) {
  debug('Setting cookie signing keys: ' + app.config.cookies.keys.join(', '));
  app.keys = app.config.cookies.keys;
};


