/**
 * Exceptions and error handlers.
 */

var _ = require('lodash'),
  Promise = require('bluebird'),
  util = require('util');


/**
 * Convert given error to view object.
 *
 * @param error {Error} error object.
 *
 * @private
 */
_toViewObject = exports.toViewObject = function(error) {
  if (_.isFunction(error.toViewObject)) {
    return error.toViewObject();
  } else {
    return Promise.resolve({
      msg: error.toString()
    });
  }
};





/**
 * Base error class.
 *
 * @param msg {String} error message.
 * @param status {Number} HTTP return status code to set.
 */
var BaseError = exports.BaseError = function(msg, status) {
  this.name = 'BaseError';
  this.message = msg || 'An error occurred';
  this.status = status || 500;

  BaseError.super_.call(this, this.message);
  BaseError.super_.captureStackTrace(this, arguments.callee);
};
util.inherits(BaseError, Error);
/**
 * Get renderable representation of this error.
 *
 * @return {Promise}
 */
BaseError.prototype.toViewObject = function() {
  return Promise.resolve({
    type: this.name,
    message: this.message
  });
};




/**
 * A group of errors.
 *
 * @param errors {Object} key-value map of errors.
 * @param status {Number} HTTP return status code to set.
 */
var MultipleError = exports.MultipleError = function(errors, status) {
  MultipleError.super_.call(this, 'There were multiple errors');
  this.name = 'MultipleError';
  this.status = status;
  this.errors = errors;
};
util.inherits(MultipleError, BaseError);
/**
 * @see BaseError#toViewObject
 */
MultipleError.prototype.toViewObject = function() {
  var self = this;

  return Promise.props(
      _.mapValues(self.errors, function(err) {
        return _toViewObject(err);
      })
    )
    .then(function gotViewObjects(viewObjects) {
      return {
        type: self.name,
        errors: viewObjects
      };
    });
};



/**
 * Form validation errors.
 *
 * This is a special instance of MultipleError.
 *
 * @param errors {Object} key-value map of errors.
 */
var FormValidationErrors = exports.FormValidationErrors = function() {
  FormValidationErrors.super_.apply(this, _.toArray(arguments));
  this.name = 'FormValidationError';
  this.status = this.status || 400;
};
util.inherits(FormValidationErrors, MultipleError);




