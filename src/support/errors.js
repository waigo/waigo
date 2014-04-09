"use strict";


/**
 * Exceptions and error handlers.
 */

var _ = require('lodash'),
  util = require('util');


var waigo = require('../../'),
  mixins = waigo.load('support/mixins');


mixins.applyTo(Error, mixins.HasViewObject);



/**
 * Get renderable representation of this error.
 *
 * You should use `BaseError`-derived error classes instead of one as they provide a number of useful features.
 *
 * @see mixins
 * @return {Object} Plain object.
 */
Error.prototype.toViewObject = function*(ctx) {
  return {
    type: this.name || 'Error',
    msg: this.message
  };
};



/**
 * Runtime error.
 *
 * This represents an error which occurred. Waigo prefers to use this rather than `Error` it is more informative.
 *
 * @param {String} msg Error message.
 * @param {Number} status HTTP return status code to set.
 */
var RuntimeError = exports.RuntimeError = function(msg, status) {
  Error.call(this);
  this.name = 'RuntimeError';
  this.message = msg || 'An error occurred';
  this.status = status || 500;
  Error.captureStackTrace(this, RuntimeError);
};
util.inherits(RuntimeError, Error);







/**
 * Multiple request errors grouped together.
 *
 * This error represents a group of related `Error` instances.
 *
 * @param {Object} errors Map of errors, where each value is itself a `Error` instance.
 * @param {Number} status HTTP return status code to set.
 */
var MultipleError = exports.MultipleError = function(msg, status, errors) {
  RuntimeError.call(this, msg || 'Multiple errors occurred', status);
  this.name = 'MultipleError';
  this.errors = errors || {};
  Error.captureStackTrace(this, MultipleError);
};
util.inherits(MultipleError, RuntimeError);


/**
 * Get renderable representation of this error.
 *
 * @see mixins
 * @return {Object} Plain object.
 */
MultipleError.prototype.toViewObject = function*(ctx) {
  var ret = yield RuntimeError.prototype.toViewObject.call(this, ctx);
  ret.errors = {};

  for (var id in this.errors) {
    ret.errors[id] = yield this.errors[id].toViewObject(ctx);
  }

  return ret;
};




/**
 * Define an Error.
 *
 * This is a convenience method for quickly creating custom error classes.
 *
 * @param {String} newClassName Name of this new error type.
 * @param {Class} [baseClass] Base class (should be a subtype of `Error`) to derivce this new error from. Default is `RuntimeError`.
 *
 * @return {Function} The new error class.
 */
exports.define = function(newClassName, baseClass) {
  baseClass = baseClass || RuntimeError;

  var newErrorClass = function() {
    (baseClass).apply(this, arguments);
    this.name = newClassName;
    Error.captureStackTrace(this, newErrorClass);
  };
  util.inherits(newErrorClass, (baseClass));
  return newErrorClass;
};








