"use strict";


const waigo = global.waigo;



/**
 * Setup ACL.
 *
 * This should be preceded by startup: `models`.
 *
 * @param {Object} app The application.
 */
module.exports = function*(app) {
  app.logger.debug('Setting up ACL');

  app.acl = yield (waigo.load('support/acl')).init(app);
};
