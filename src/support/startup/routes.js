"use strict";



const waigo = global.waigo,
  _ = waigo._;





/**
 * Setup route mappings.
 *
 * This sets up a `koa-trie-router` and maps routes to it using the 
 * [route mapper](../routeMapper.js.html).
 * 
 * @param {Object} app The application.
 */
module.exports = function*(app) {
  app.logger.debug('Setting up routes');

  var routeFiles = waigo.getItemsInFolder('routes');

  let routes = {};

  _.each(routeFiles, function(routeFile) {
    app.logger.debug('Loading ' + routeFile);

    _.merge(routes, waigo.load(routeFile));
  });

  app.routes = yield waigo.load('support/routeMapper')
    .setup(app, app.config.middleware, routes);
};




