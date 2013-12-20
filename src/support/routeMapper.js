/**
 * Route -> Controller mapper.
 */

var _ = require('lodash'),
  Promise = require('bluebird'),
  koaRoute = require('koa-route'),
  waigo = GLOBAL.waigo;

var BaseError = waigo.load('support.errors').BaseError;


/**
 * Map given routes to controllers.
 * @param routes {Array} list of route definitions.
 *
 * @return {Object} loaded controllers (controller name -> Array of mapped request handlers)
 */
exports.map = function(routes) {
  var _controllers = {},
    ret = {};

  _.each(routes, function(route) {
    var controllerName = route.controller,
      controller = _controllers[controllerName];
    if (!controller) {
      controller = _controllers[controllerName] = waigo.load('controllers.' + controllerName);
    }

    var possibleMappings = [];

    _.each(route.map, function(controllerMethod, httpMethodAndPath) {
      // TODO: refactor using destructuring once available in V8
      var tmpTokens = httpMethodAndPath.split(' '),
        httpMethod = tmpTokens[0],
        path = tmpTokens[1];

      // check http method
      httpMethod = httpMethod.toLowerCase();
      if (0 > _.indexOf(['options', 'get', 'head', 'post', 'put', 'delete', 'del'], httpMethod)) {
        throw new BaseError('Unsupported HTTP method in: ' + httpMethodAndPath);
      }

      // check controller method
      if (!_.isFunction(controller[controllerMethod])) {
        throw new BaseError('Controller "' + controllerName + '" has no method named: ' + controllerMethod);
      }

      possibleMappings.push([httpMethod, path, controller[controllerMethod]]);
    });

    // now order by path (specific to general)
    // put the routes into order (specific to general)
    var orderedMappings = _.sortBy(possibleMappings, function(mapping) {
      return mapping[1];
    });

    _.each(orderedMappings.reverse(), function(mapping) {
      if (!ret[controllerName]) {
        ret[controllerName] = [];
      }

      ret[controllerName].push(
        koaRoute[mapping[0]](mapping[1], mapping[2])
      );
    });
  });

  return ret;
};