"use strict";


const waigo = global.waigo;



/**
 * Setup ACL.
 *
 * This should be preceded by startup: `models`.
 *
 * @param {Object} app The application.
 */
module.exports = function*(App) {
  App.logger.debug('Setting up ACL');

  App.acl = yield (waigo.load('support/acl')).init(App);
};
