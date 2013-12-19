/**
 * Base controller class.
 */

var _ = require('lodash'),
  async = require('async'),
  waigo = GLOBAL.waigo;


/**
 * Constructor.
 *
 * @param {Object} app the app instance (for convenience sake).
 * @param {String} viewFolder folder containing views for this controller, relative to parent controller's view folder
 * (if this has a parent controller) or relative to the base folder for all views.
 */
var Controller = function(app, viewFolder) {
  var self = this;

  self.app = app;
  self.viewFolder = viewFolder || '';

  self._mappings = [];
};





/**
 * Map routes to methods.
 *
 * @param paths {Object} path-details map.
 *
 * @throws Error if an errors occur.
 */
Controller.prototype.map = function(paths) {
  var self = this;

  _.each(paths, function(val, url) {
    self._mappings.push(_.extend(val, {
      url: url
    }));
  });

  self._setupRoutes();
};






/**
 * Setup app routes based on this controller's config.
 *
 * @private
 */
Controller.prototype._setupRoutes = function() {
  var self = this;

  var routes = self._mappings;

  // put the routes into order (specific to general)
  var orderedRoutes = _.sortBy(routes, function(route) {
    return route.url;
  });

  _.each(orderedRoutes.reverse(), function(route) {
    var fn = self[route.method],
      httpMethod = route.httpMethod.toLowerCase(),
      urlPath = route.url;

    // if the function does not exist then throw an error

    if (_.isUndefined(fn) || !_.isFunction(fn)) {
      throw new Error('Unable to find method "' + route.method + '" on controller for path: ' + urlPath);
    }

    var setupArgs = [urlPath];
    setupArgs.push(self._buildHandler(fn));
    self.app[httpMethod].apply(self.app, setupArgs);
  });
};




/**
 * Build a route handler method.
 *
 * The handler method proxies certain calls of the response object.
 *
 * @param {Function} fn actual handler method.
 *
 * @private
 */
Controller.prototype._buildHandler = function(fn) {
  var self = this;

  return function(req, res, next) {
    var context = {
      res: res,
      next: next
    };

    var customRes = {
      send: _.bind(self._send, self, context),
      render: _.bind(self._render, self, context),
      redirect: _.bind(self._redirect, self, context)
    };

    fn.call(self, req, customRes, next);
  };
};




/**
 * Send response to client.
 */
Controller.prototype._send = function(context, data, headers, status) {
  data = data || '';
  headers = headers || {};
  status = status || 200;

  context.res.send(data, headers, status);
};



/**
 * Render response and send to client.
 */
Controller.prototype._render = function(context, viewTemplate, locals, headers, status) {
  // convert locals to view objects
  locals = locals || {};
  var viewObjects = {};

  async.forEach(_.keys(locals), function(key, done) {
    var obj = locals[key],
      objMethod = obj['toViewObject'];

    if (_.isFunction(objMethod)) {
      objMethod.call(obj, function (err, viewObject) {
        if (err) return done(err);

        viewObjects[key] = viewObject;

        done();
      });
    } else {
      viewObjects[key] = locals[key];

      done();
    }
  }, function (err) {
    if (err) return context.next(err);

    _.extend(context, {
      headers: headers,
      status: status
    });

    try {
      context.res.outputFormatter.render(context, viewTemplate, viewObjects);
    } catch (err) {
      context.next(err);
    }
  });
};



/**
 * Redirect client.
 */
Controller.prototype._redirect = function(context, path, status) {
  path = path || '';

  _.extend(context, {
    headers: {},
    status: status
  });

  try {
    context.res.outputFormatter.redirect(context, path);
  } catch (err) {
    context.next(err);
  }
};




module.exports.Controller = Controller;



