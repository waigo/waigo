"use strict";


const route = require('koa-trie-router'),
  util = require('util');

const waigo = global.waigo,
  _ = waigo._,
  errors = waigo.load('support/errors');


const RouteError = exports.RouteError = errors.define('RouteError');

const METHODS = ['GET', 'POST', 'DEL', 'DELETE', 'PUT', 'OPTIONS', 'HEAD'];





/**
 * Load and initialise given middleware module.
 * 
 * @param  {Object|String} middlewareName Name of middleware module file or object representing combined name and options: `{ id: <middleware mame>, ...}`.
 * @param  {Object} [middlewareOptions] Middleware options.
 * 
 * @return {Function}
 */
var loadMiddleware = function(middlewareName, middlewareOptions) {
  if (_.isPlainObject(middlewareName)) {
    middlewareOptions = _.omit(middlewareName, 'id');
    middlewareName = middlewareName.id;
  } else {
    // if reference is of form 'moduleName.xx.yy' then it's a controller reference
    if (0 < middlewareName.indexOf('.')) {
      return loadController(middlewareName);
    }

    middlewareOptions = middlewareOptions || {};
  }

  return waigo.load(`support/middleware/${middlewareName}`)(middlewareOptions);
};



/**
 * Load given controller.method
 * 
 * @param  {String} controller String of form `<controller path>.<method name>`.
 * 
 * @return {Function}
 */
var loadController = function(controller) {
  let tokens = controller.split('.'),
    controllerPath = tokens,
    methodName = tokens.pop(),
    controllerName = controllerPath.join('.');

  let mod = waigo.load(`controllers/${controllerPath.join('/')}`);

  if (!_.isFunction(mod[methodName])) {
    throw new RouteError(`Unable to find method "${methodName}" on controller "${controllerName}"`);
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
 * @param  {Object} parentConfig.preMiddleware Resolved pre-middleware for all routes in this node.
 * 
 * @return {Array} List of route mappings.
 */
var buildRoutes = function(logger, commonMiddleware, urlPath, node, parentConfig) {
  urlPath = parentConfig.urlPath + urlPath;

  logger.debug('Route', urlPath);

  // make a shallow copy (so that we can delete keys from it)
  node = _.extend({}, node);

  // load parent middleware
  let resolvedPreMiddleware = parentConfig.preMiddleware.concat(
    _.map(node.pre || [], loadMiddleware)
  );
  delete node.pre;

  let mappings = [];

  // iterate through each possible method
  _.each(METHODS , function(m) {
    if (node[m]) {
      let routeMiddleware = _.isArray(node[m]) ? node[m] : [node[m]];

      mappings.push({
        method: m,
        name: node.name || urlPath,
        url: urlPath,
        resolvedMiddleware: commonMiddleware[m].concat(
          resolvedPreMiddleware, 
          _.map(routeMiddleware, function(rm) {
            return loadMiddleware(rm);
          })
        )
      });
    }

    delete node[m];
  });

  // delete name
  delete node.name;

  // go through children
  _.each(node || {}, function(subNode, subUrlPath) {
    mappings = mappings.concat(
      buildRoutes(logger, commonMiddleware, subUrlPath, subNode, {
        urlPath: urlPath,
        preMiddleware: resolvedPreMiddleware,
      })
    );
  });

  return mappings;
};


/**
 * Load middleware specified in config object.
 * 
 * @return {Array}
 */
var loadCommonMiddleware = function(logger, middleware) {
  middleware = middleware || {};

  return _.map(middleware._order, function(m) {
    logger.debug('Setting up middleware', m);
    
    return loadMiddleware(m, middleware[m]);
  });
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
  let logger = app.logger.create('RouteMapper');

  let possibleMappings = [];

  // resolve middleware for different HTTP methods
  let commonMiddleware = {};
  _.each(METHODS, function(method) {
    logger.debug('Setting up HTTP method middleware', method);

    commonMiddleware[method] = 
      loadCommonMiddleware(logger, app.config.middleware[method]);
  });

  // build mappings
  _.each(routes, function(node, urlPath) {
    possibleMappings = possibleMappings.concat(
      buildRoutes(logger, commonMiddleware, urlPath, node, {
        urlPath: '',
        preMiddleware: [],
      })
    );
  });

  // now order by path (specific to general)
  // put the routes into order (specific to general)
  let orderedMappings = possibleMappings.sort(function(a, b) {
    return a.url < b.url;
  });

  app.routes = {
    all: orderedMappings,
    byName: {}
  };

  // add the handlers to routing
  _.each(orderedMappings, function(mapping) {
    let route = app.route(mapping.url);

    route[mapping.method.toLowerCase()].apply(route, mapping.resolvedMiddleware);

    // save to app
    app.routes.byName[mapping.name] = mapping;
  });
};


