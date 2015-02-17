"use strict";


var debug = require('debug')('waigo-routemapper'),
  route = require('koa-trie-router'),
  util = require('util'),
  waigo = require('../../'),
  _ = waigo._;


var errors = waigo.load('support/errors'),
  RouteError = exports.RouteError = errors.define('RouteError');





/**
 * Load and initialise given middleware module.
 * 
 * @param  {Object|String} middleware Name of middleware module file or object of form `{ id: <module file mame>, ...}`.
 * 
 * @return {Function}
 */
var loadMiddleware = function(middleware) {
  let middlewareName = middleware,
    middlewareOptions = {};

  // if reference is an object then it's a middleware reference with initialisation options
  if (_.isPlainObject(middleware)) {
    middlewareName = middleware.id;
    _.extend(middlewareOptions, middleware);
  } else {
    // if reference is of form 'moduleName.xx.yy' then it's a controller reference
    if (0 < middleware.indexOf('.')) {
      return loadController(middleware);
    }
  }

  return waigo.load('support/middleware/' + middlewareName)(middlewareOptions);
};



/**
 * Load given controller.method
 * 
 * @param  {String} controller String of form `<controller path>.<method name>`.
 * 
 * @return {Function}
 */
var loadController = function(controller) {
  var tokens = controller.split('.'),
    controllerPath = tokens,
    methodName = tokens.pop(),
    controllerName = controllerPath.join('.');

  var mod = waigo.load('controllers/' + controllerPath.join('/'));

  if (!_.isFunction(mod[methodName])) {
    throw new RouteError('Unable to find method "' + methodName + '" on controller "' + controllerName + '"');
  }

  return mod[methodName];
};




/**
 * Build routes from given configuration config node.
 * 
 * @param  {Object} urlPath URL path of this node (relative to parent URL path).
 * @param  {Object} node Config node.
 * @param  {Object} parentConfig parent node config. 
 * @param  {Object} parentConfig.urlPath URL path of parent node.
 * @param  {Object} parentConfig.middleware Common middleware for parent node.
 * @return {Array} List of route mappings.
 */
var buildRoutes = function(logger, urlPath, node, parentConfig) {
  urlPath = parentConfig.urlPath + urlPath;

  logger.debug('Route', urlPath);

  // load common middleware
  var middleware = parentConfig.middleware.concat(
    _.map(node.middleware || [], loadMiddleware)
  );

  var mappings = [];

  // iterate through each possible method
  _.each(['GET', 'POST', 'DEL', 'DELETE', 'PUT', 'OPTIONS', 'HEAD'], function(m) {
    if (node[m]) {
      var routeMiddleware = _.isArray(node[m]) ? node[m] : [node[m]];

      mappings.push({
        method: m,
        url: urlPath,
        resolvedMiddleware: middleware.concat(
          _.map(routeMiddleware, function(rm) {
            return loadMiddleware(rm);
          })
        )
      });
    }
  });

  // go through children
  _.each(node.sub || {}, function(subNode, subUrlPath) {
    mappings = mappings.concat(
      buildRoutes(logger, subUrlPath, subNode, {
        urlPath: urlPath,
        middleware: middleware,
      })
    );
  });

  return mappings;
};



/**
 * Map given routes to controllers.
 *
 * @param app {Object} the koa app to map routes on.
 * @param routes {Array} list of route definitions.
 *
 * Upon completion `app.controllers` will hold the loaded controller instances. 
 * And `app.router` will be setup with the route mappings.
 *
 * @throws RouteError if there are any problems.
 */
exports.map = function(app, routes) {
  var logger = app.logger.create('RouteMapper');

  var possibleMappings = [];

  // build mappings
  _.each(routes, function(node, urlPath) {
    possibleMappings = possibleMappings.concat(
      buildRoutes(logger, urlPath, node, {
        urlPath: '',
        middleware: [],
      })
    );
  });

  // now order by path (specific to general)
  // put the routes into order (specific to general)
  var orderedMappings = _.sortBy(possibleMappings, function(mapping) {
    return mapping.url;
  });

  _.each(orderedMappings.reverse(), function(mapping) {
    var route = app.route(mapping.url);
    route[mapping.method.toLowerCase()].apply(route, mapping.resolvedMiddleware);
  });
};


