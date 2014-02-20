var _ = require('lodash'),
  Promise = require('bluebird'),
  waigo = require('../../../'),
  errors = waigo.load('support/errors');


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
    context.body = yield errors.toViewObject(err);
    context.type = 'json';
    if (config.showStack) {
      context.body.stack = err.stack.split("\n");
    }
    if (context.app.logger) {
      context.app.logger.error(err.message, err);
    }
  } catch (err) {
    context.app.emit('error', err);
  }
};



/**
 * Build error handler middleware.
 *
 * @param config {Object} options.
 * @parma config.showStack {Boolean} whether to show the stack trace in error output. Default is false.
 *
 * @return {Function} middleware
 */
module.exports = function(config) {
  config = _.extend({
    showStack: false
  }, config);

  return function*(next) {
    try {
      yield next;
    } catch (err) {
      yield render(this, config, err);
    }
  }
};
