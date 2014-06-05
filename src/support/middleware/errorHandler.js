"use strict";


var _ = require('lodash'),
  waigo = require('../../../'),
  errors = waigo.load('support/errors'),
  mixins = waigo.load('support/mixins');


var viewObjectMethod = Object.keys(mixins.HasViewObject).pop();


/**
 * Render given error back to client.
 * @param context {Object} request context.
 * @param config {Object} error handler config.
 * @param err {Error} the error
 * @return {*}
 * @private
 */
var render = function*(context, config, err) {
  try {
    context.status = err.status || 500;

    context.body = yield errors[viewObjectMethod].call(null, context, err);

    context.type = 'json';

    if (config.showStack) {
      context.body.stack = err.stack.split("\n");
    }
    if (context.app.logger) {
      context.app.logger.error(err.stack);
    }
  } catch (err) {
    context.app.emit('error', err);
  }
};



/**
 * Build error handler middleware.
 *
 * This will catch any errors thrown from downstream middleware or controller 
 * handler functions.
 * 
 * @param {Object} options Configuration options.
 * @parma {Boolean} [options.showStack] whether to show the stack trace in error output. Default is false.
 *
 * @return {Function} middleware
 */
module.exports = function(options) {
  options = _.extend({
    showStack: false
  }, options);

  return function*(next) {
    try {
      yield next;
    } catch (err) {
      yield render(this, options, err);
    }
  }
};
