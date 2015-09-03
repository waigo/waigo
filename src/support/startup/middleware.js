"use strict";


var debug = require('debug')('waigo-startup-middleware'),
  waigo = global.waigo;


/**
 * Setup middleware common to all requests.
 *
 * @param {Object} app The application.
 * @param {Array} app.config.middleware Names of middleware to initialise.
 */
module.exports = function*(app) {
  for (let idx in app.config.middleware.ALL._order) {
    let m = app.config.middleware.ALL._order[idx];

    debug('Setting up middleware: ' + m);

    app.use(waigo.load('support/middleware/' + m)(
      app.config.middleware.ALL[m] || {}
    ));
  }
};
