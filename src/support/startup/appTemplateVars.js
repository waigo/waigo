"use strict";

const waigo = global.waigo,
  _ = waigo._;


/**
 * Setup app-level template variables.
 *
 * This startup step should run after all others.
 *
 * @param {Object} App The application.
 */
module.exports = function*(App) {
  App.templateVars = {
    _: _,
    routeUrl: App.routes.url.bind(App.routes),
    staticUrl: App.staticUrl,
    config: App.config,
  };
};




