"use strict";


var debug = require('debug')('waigo-startup-routes'),
  queryString = require('query-string');


var waigo = require('../../../'),
  _ = waigo._;



/** 
 * Build URL to given route.
 * @param  {App} app         The app.
 * @param  {String} routeName   Name of route.
 * @param  {Object} [urlParams]   URL params for route.
 * @param  {Object} [queryParams] URL query params.
 * @param {Object} [options] Options.
 * @param {Boolean} [options.absolute] If `true` then return absolute URL including site base URL.
 * @return {String}             Route URL
 */
var routeUrl = function(app, routeName, urlParams, queryParams, options) {
  options = _.extend({
    absolute: false
  }, options);

  debug('Generate URL for route ' + routeName);

  var route = app.routes.byName[routeName];

  if (!route) {
    throw new Error('No route named: ' + routeName);
  }

  var str = options.absolute ? app.config.baseURL : '';

  str += route.url;

  // TODO: integrate params
  if (!_.isEmpty(queryParams)) {
    str += '?' + queryString.stringify(queryParams);
  }

  return str;
};




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

  // helper to build a URL based on a route
  app.routeUrl = app.locals.routeUrl = _.bind(routeUrl, null, app);
};




