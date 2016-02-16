"use strict";


const waigo = global.waigo,
  acl = waigo.load('support/acl');



/**
 * Setup ACL.
 *
 * This should be preceded by startup: `models`.
 *
 * @param {Object} app The application.
 */
module.exports = function*(app) {
  app.logger.debug('Setting up ACL');

  app.acl = yield acl.init(app);
};
