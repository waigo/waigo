"use strict";


var _ = require('lodash'),
  debug = require('debug')('waigo-startup-routes'),
  waigo = require('../../../');


/**
 * Setup route mappings.
 *
 * This sets up a `koa-trie-router` and maps routes to it using the 
 * [route mapper](../routeMapper.js.html).
 * 
 * @param {Object} app The application.
 */
module.exports = function*(app) {
  debug('Setting up routes');

  require('koa-trie-router')(app);

  var routeFiles = waigo.getFilesInFolder('routes');

  app.routes = {};

  _.each(routeFiles, function(routeFile) {
    debug('Loading ' + routeFile);

    _.extend(app.routes, waigo.load(routeFile));
  });

  waigo.load('support/routeMapper').map(app, app.routes);

  app.use(app.router);
};
