"use strict";


var debug = require('debug')('waigo-routemapper'),
  route = require('koa-trie-router'),
  util = require('util'),
  waigo = require('../../'),
  _ = waigo._;


var errors = waigo.load('support/errors'),
  RouteError = exports.RouteError = errors.define('RouteError');



/**
 * Parse a route http method and URL string.
 *
 * @param str {String} in the form "(httpMethod) (url)", e.g. "GET /index"
 *
 * @return {Object} object with form `{ method: (httpMethod), url: (url) }`.
 *
 * @throws RouteError if route URL is invalid or using an unsupported HTTP method.
 */
var parseMethodUrl = function(str) {
  var tokens = _.str.clean(str).split(' ');
  if (2 !== tokens.length) {
    throw new RouteError('Invalid route URL format: ' + str);
  }
  var result = {
    method: tokens[0],
    url: '/' + _.str.ltrim(tokens[1], '/')
  };
  if (-1 === _.indexOf(['GET', 'POST', 'DEL', 'DELETE', 'PUT', 'OPTIONS', 'HEAD'], result.method)) {
    throw new RouteError('Unsupported route HTTP method: ' + result.method);
  }
  return result;
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

  var controllers = app.controllers = {},
    possibleMappings = [];

  _.each(routes, function(middleware, urlPath) {
    logger.debug('Route', urlPath);

    if (!_.isArray(middleware)) {
      middleware = [middleware];
    }

    var mapping = parseMethodUrl(urlPath);

    // load all middleware
    mapping.resolvedMiddleware = _.map(middleware, function(ref) {
      logger.debug('Middleware', ref);

      // if reference is of form 'moduleName.xx.yy' then it's a controller reference
      var dotPos = ('string' === typeof ref) && ref.indexOf('.');
      if (0 < dotPos) {
        var tokens = ref.split('.'),
          controllerPath = tokens,
          methodName = tokens.pop(),
          controllerName = controllerPath.join('.');

        // load controller if not already done so
        if (!controllers[controllerName]) {
          controllers[controllerName] = waigo.load('controllers/' + controllerPath.join('/'));
        }

        if (!_.isFunction(controllers[controllerName][methodName])) {
          throw new RouteError('Unable to find method "' + methodName + '" on controller "' + controllerName + '"');
        }

        return controllers[controllerName][methodName];
      }
      // else it's a middleware reference
      else {
        let middlewareName = ref,
          middlewareOptions = {};

        // if reference is an object then it's a middleware reference with initialisation options
        if (_.isPlainObject(ref)) {
          middlewareName = ref.id;
          _.extend(middlewareOptions, ref);
        }

        return waigo.load('support/middleware/' + middlewareName)(middlewareOptions);
      }
    });

    possibleMappings.push(mapping);
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


