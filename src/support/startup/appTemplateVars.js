"use strict";

const waigo = global.waigo,
  _ = waigo._;


/**
 * Setup app-level template variables.
 *
 * This startup step should run after all others.
 *
 * @param {Object} app The application.
 */
module.exports = function*(app) {
  app.templateVars = {
    _: _,
    routeUrl: app.routes,
    staticUrl: app.staticUrl,
    config: app.config,
  };
};




