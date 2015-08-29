"use strict";

var waigo = require('../../../'),
  _ = waigo._;


/**
 * Setup action tokens interface and request processor.
 *
 * @param {Object} app The application.
 */
module.exports = function*(app) {
  var mod = waigo.load('support/actionTokens');

  app.actionTokens = yield mod.init(
    app, app.config.actionTokens
  );
};







