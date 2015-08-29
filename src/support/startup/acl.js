"use strict";



var debug = require('debug')('waigo-startup-acl'),
  waigo = require('../../../'),
  acl = waigo.load('support/acl'),
  _ = waigo._;



/**
 * Setup ACL.
 *
 * This should be preceded by startup: `models`.
 *
 * @param {Object} app The application.
 */
module.exports = function*(app) {
  debug('Setting up ACL');

  app.acl = yield acl.init(app);
};
