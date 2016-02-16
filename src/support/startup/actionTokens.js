"use strict";

const waigo = global.waigo,
  _ = waigo._;


/**
 * Setup action tokens interface and request processor.
 *
 * @param {Object} app The application.
 */
module.exports = function*(app) {
  let mod = waigo.load('support/actionTokens');

  app.actionTokens = yield mod.init(
    app, app.config.actionTokens
  );
};







