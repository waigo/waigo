"use strict";


var waigo = require('../../../'),
  _ = waigo._,
  errors = waigo.load('support/errors'),
  viewObjects = waigo.load('support/viewObjects');



/**
 * Render given error back to client.
 * @param config {Object} error handler config.
 * @param err {Error} the error
 * @return {*}
 * @private
 */
var render = function*(config, err) {
  this.status = err.status || 500;

  var error = yield err[viewObjects.methodName].call(err, this);

  error.status = this.status;
  error.request = {
    method: this.request.method,
    url: this.request.url,
  };

  if (config.showStack) {
    error.stack = err.stack.split("\n");
  }

  try {
    yield this.render('error', error);
  } catch (err) {
    this.app.emit('error', err);

    this.type = 'json';
    this.body = err;
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
    // convenient throw method
    this.throw = _throw;

    try {
      yield next;
    } catch (err) {
      this.app.emit('error', err.stack);

      // render error page
      yield render.call(this, options, err);
    }
  }
};


/**
 * Throw an error
 * @param  {Class} [errorClass] Error class. Default is `RuntimeError`.
 * @param  {Any} ...       Additional arguments get passed to error class constructor.
 * @throws Error
 */
var _throw = function() {
  var args = Array.prototype.slice.call(arguments),
    ErrorClass = args[0];

  if (_.isObject(ErrorClass)) {
    args.shift();
  } else {
    ErrorClass = errors.RuntimeError;
  }

  args.unshift(null);   // the this arg for the .bind() call

  throw new (Function.prototype.bind.apply(ErrorClass, args));
};


