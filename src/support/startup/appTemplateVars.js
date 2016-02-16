"use strict";

const waigo = global.waigo,
  _ = waigo._;


/**
 * Setup app-level template variables.
 *
 * @param {Object} app The application.
 */
module.exports = function*(app) {
  app.templateVars = {
    _: _,
    config: app.config,
  };
};




