"use strict";

var waigo = require('../../../'),
  _ = waigo._;


/**
 * Setup action tokens interface and request processor.
 *
 * @param {Object} app The application.
 */
module.exports = function*(app) {
  app.actionTokens = yield waigo.load('support/actionTokens').init(
    app, app.config.actionTokens
  );
};







