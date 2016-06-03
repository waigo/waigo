"use strict";


/**
 * Shutdown database connection.
 *
 * @param {Object} app The application.
 */
module.exports = function*(App) {
  App.logger.debug('Shutting down ACL');

  if (App.acl) {
    yield App.acl.shutdown();
  }
};


