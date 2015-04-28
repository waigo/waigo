"use strict";


var util = require('util');


var waigo = require('../../'),
  _ = waigo._,
  viewObjects = waigo.load('support/viewObjects');



/**
 * Get renderable representation of this `Error`.
 *
 * Is is better to use `RuntimeError`-derived error classes instead of `Error` 
 * as they provide other useful features. However unexpected errors may occur 
 * which is why it is important to be able to process them for output.
 * 
 * @return {Object} Plain object.
 */
Error.prototype[viewObjects.methodName] = function*(ctx) {
  var ret = {
    type: this.name || 'Error',
    msg: this.message,
    details: {},
  };

  // add additional data
  for (let k in this) {
    ret.details[k] = this[k];
  }

  return ret;
};



/**
 * Base runtime error class.
 *
 * Use this in preference to `Error` where possible as it provides for more 
 * descriptive output. 
 *
 * @param {String} [msg] Error message.
 * @param {Number} [status] HTTP return status code to set. Default is 500.
 * @param {Object} [data] Additional data pertaining to this error.
 */
var RuntimeError = exports.RuntimeError = function(msg, status, data) {
  Error.call(this);
  this.name = 'RuntimeError';
  this.message = msg || 'An error occurred';
  this.status = status || 500;
  this.data = data || null;
  Error.captureStackTrace(this, RuntimeError);
};
util.inherits(RuntimeError, Error);




/**
 * Get renderable representation of this error.
 *
 * @return {Object} Plain object.
 */
RuntimeError.prototype[viewObjects.methodName] = function*(ctx) {
  var ret = {
    type: this.name,
    msg: this.message,
    details: this.data,
  };

  return ret;
};






/**
 * Represents multiple errors grouped together.
 *
 * Sometimes we may wish to report multiple related errors (e.g. form field 
 * validation failures). This error class makes it easy to do so.
 *
 * @param {Object} errors Map of errors, where each value is itself an `Error` instance.
 * @param {Number} status HTTP return status code to set.
 */
var MultipleError = exports.MultipleError = function(msg, status, errors) {
  RuntimeError.call(this, msg || 'Multiple errors occurred', status, errors);
  this.name = 'MultipleError';
  Error.captureStackTrace(this, MultipleError);
};
util.inherits(MultipleError, RuntimeError);



/**
 * Get renderable representation of this error.
 *
 * This collects view object representations of all the sub-errors and into a 
 * single object.
 *
 * @return {Object} Plain object.
 */
MultipleError.prototype[viewObjects.methodName] = function*(ctx) {
  var ret = {
    type: this.name,
    msg: this.message,
    details: {},
  };

  for (let id in this.data) {
    let fn = this.data[id][viewObjects.methodName];

    ret.details[id] = (fn ? yield fn(ctx) : this.data[id]);
  }

  return ret;
};





/**
 * Define an `Error` class.
 *
 * This is a convenience method for quickly creating custom error classes which 
 * inherit from `Error` and have all the correct properties setup.
 *
 * @param {String} newClassName Name of this new error type.
 * @param {Class} [baseClass] Base class to derive the new class from. Default is `RuntimeError`.
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


