"use strict";


/**
 * Shutdown database connection.
 *
 * @param {Object} app The application.
 */
module.exports = function*(app) {
  app.logger.debug('Shutting down ACL');

  if (app.acl) {
    yield app.acl.shutdown();
  }
};


