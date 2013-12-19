/**
 * Exceptions and error handlers.
 */

var _ = require('lodash'),
  async = require('async'),
  Q = require('q'),
  util = require('util');


/**
 * Convert given error to view object.
 *
 * @param error {Error} error object.
 * @param cb {Function} callback.
 *
 * @private
 */
var _toViewObject = function(error, cb) {
  if (_.isFunction(error.toViewObject)) {
    return error.toViewObject(cb);
  } else {
    cb(null, error.toString());
  }
};





/**
 * Base error class.
 *
 * @param [msg] {String} error message.
 * @param [statusCode] {Number} HTTP return status code to set.
 */
var BaseError = exports.BaseError = function(msg, statusCode) {
  this.name = 'Error';
  this.message = msg || 'An error occurred';
  this.statusCode = statusCode || 500;

  BaseError.super_.call(this, this.message);
  BaseError.super_.captureStackTrace(this, arguments.callee);
};
util.inherits(BaseError, Error);
/**
 * Get view object representation of this error.
 *
 * @param cb {Function} callback
 */
BaseError.prototype.toViewObject = function(cb) {
  cb(null, {
    type: this.name,
    message: this.message
  });
};




/**
 * A group of errors.
 *
 * @param errors {Object} key-value map of errors.
 */
var MultipleError = exports.MultipleError = function(errors) {
  MultipleError.super_.call(this, 'There were multiple errors');
  this.name = 'MultipleError';
  this.errors = errors;
};
util.inherits(MultipleError, BaseError);


MultipleError.prototype.toViewObject = function(cb) {
  var self = this;

  var processedErrors = {};

  // convert all child errors to view objects
  async.forEach(_.keys(self.errors), function (key, cbForEach) {
    var error = self.errors[key];

    if (_.isFunction(error.toViewObject)) {
      error.toViewObject(function gotViewObject(err, viewObject) {
        if (err) return cbForEach(err);

        processedErrors[key] = viewObject;

        cbForEach();
      });
    } else {
      processedErrors[key] = error.toString();

      cbForEach();
    }
  }, function (err) {
    cb(err, {
      type: self.name,
      errors: processedErrors
    });
  });
};



/**
 * Form validation errors.
 *
 * This is a special instance of MultipleError.
 *
 * @param errors {Object} key-value map of errors.
 */
var FormValidationErrors = exports.FormValidationError = function() {
  FormValidationErrors.super_.apply(this, _.toArray(arguments));
  this.name = 'FormValidationError';
  this.statusCode = 400;
};
util.inherits(FormValidationErrors, MultipleError);






/**
 * Build error handler middleware.
 *
 * @param config {Object} options.
 * @parma config.showStack {Boolean} whether to show the stack trace in error output. Default is false.
 *
 * @return {Function} middleware
 */
exports.buildMiddleware = function(config) {
  var mergedConfig = _.extend({
    showStack: false
  }, config);

  return function(err, req, res, next) {
    // log the error
    req.app.logger.error(err.name + ': ' + err.message, {
      type: err.name,
      stack: err.stack.split('\n')
    });

    // quit if no request params
    if (!req.query) return next(err);

    // setup rendering params
    var statusCode = err.statusCode || 500;

    Q.nfcall(_toViewObject, err)
      .then(function gotViewObject(viewObj) {
        var viewParams = {
          error: viewObj
        };

        if (mergedConfig.showStack) {
          viewParams.stack = err.stack;
        }

        return viewParams;
      })
      .then(function sendToClient(viewParams) {
        res.json(statusCode, viewParams);
      })
      .catch(function (err) {
        // log the error
        req.app.logger.error(err);
      })
      .done();
  }
};
