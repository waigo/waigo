"use strict";



var debug = require('debug')('waigo-startup-routes'),
  waigo = require('../../../');


/**
 * Setup routes.
 *
 * @param {Object} app The application.
 */
module.exports = function*(app) {
  debug('Setting up routes');
  require('koa-trie-router')(app);
  app.routes = waigo.load('routes');
  waigo.load('support/routeMapper').map(app, app.routes);
  app.use(app.router);
};
