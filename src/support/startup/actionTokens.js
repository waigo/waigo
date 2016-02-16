"use strict";

const waigo = global.waigo,
  _ = waigo._;


/**
 * Setup action tokens interface and request processor.
 *
 * @param {Object} app The application.
 */
module.exports = function*(app) {
  app.logger.debug('Setting up action tokens system');

  let mod = waigo.load('support/actionTokens');

  app.actionTokens = yield mod.init(
    app, app.config.actionTokens
  );
};







