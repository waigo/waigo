"use strict";


var debug = require('debug')('waigo-startup-middleware'),
  waigo = require('../../../');


/**
 * Setup middleware common to all requests.
 *
 * @param {Object} app The application.
 */
module.exports = function*(app) {
  for (let idx in app.config.middleware) {
    let m = app.config.middleware[idx] || {};

    debug('Setting up middleware: ' + m.id);

    app.use(waigo.load('support/middleware/' + m.id)(m.options));
  }
};
