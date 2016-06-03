"use strict";


const waigo = global.waigo,
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
Error.prototype[viewObjects.METHOD_NAME] = function*(ctx) {
  let ret = {
    type: this.name || 'Error',
    msg: this.message,
  };

  if (this.details) {
    ret.details = yield viewObjects.toViewObjectYieldable(this.details, ctx);
  }

  if (this.stack && _.get(ctx, 'App.config.errors.showStack')) {
    ret.stack = this.stack;
  }

  return ret;
};




/**
 * A runtime error.
 * 
 * Use this in preference to `Error` where possible as it provides for more 
 * descriptive output. 
 */
class RuntimeError extends Error {
  /**
   * Constructor.
   *
   * @param {String} [msg] Error message.
   * @param {Number} [status] HTTP return status code to set. Default is 500.
   * @param {Object} [details] Additional details pertaining to this error.
   */
  constructor (msg, status, details) {
    msg = msg || 'An error occurred';
    super(msg);
    this.name = this.constructor.name;
    this.message = msg;
    this.status = status || 500;
    this.details = details || null;
    Error.captureStackTrace(this, this.constructor);
  }
}
exports.RuntimeError = RuntimeError;



/**
 * Get renderable representation of this error.
 *
 * @return {Object} Plain object.
 */
RuntimeError.prototype[viewObjects.METHOD_NAME] = function*(ctx) {
  let ret = {
    type: this.name,
    msg: this.message,
  };

  if (this.details) {
    ret.details = yield viewObjects.toViewObjectYieldable(this.details, ctx);
  }

  if (this.stack && _.get(ctx, 'App.config.errors.showStack')) {
    ret.stack = this.stack;
  }

  return ret;
};





/**
 * Represents multiple errors grouped together.
 *
 * Sometimes we may wish to report multiple related errors (e.g. form field 
 * validation failures). This error class makes it easy to do so.
 */
class MultipleError extends RuntimeError {
  /**
   * Constructor.
   *
   * @param {String} [msg] Error message.
   * @param {Number} [status] HTTP return status code to set. Default is 500.
   * @param {Object} [subErrors] Map of errors, where each value is itself an `Error` instance.
   */
  constructor (msg, status, subErrors) {
    super(msg || 'Some errors occurred', status, subErrors || {});
  }
}
exports.MultipleError = MultipleError;



/**
 * Get renderable representation of this error.
 *
 * This collects view object representations of all the sub-errors and into a 
 * single object.
 *
 * @return {Object} Plain object.
 */
MultipleError.prototype[viewObjects.METHOD_NAME] = function*(ctx) {
  let ret = {
    type: this.name,
    msg: this.message,
    details: {},
  };

  for (let subErrorKey in this.details) {
    let subError = this.details[subErrorKey],
      fn = subError[viewObjects.METHOD_NAME];

    ret.details[subErrorKey] = (fn ? yield fn.call(subError, ctx) : subError);
  }

  if (this.stack && _.get(ctx, 'App.config.errors.showStack')) {
    ret.stack = this.stack;
  }

  return ret;
};





/**
 * Define a new error class.
 *
 * This is a convenience method for quickly creating custom error classes which 
 * inherit from existing classes. 
 *
 * @param {String} newClassName Name of this new error type.
 * @param {Class} [baseClass] Base class to derive the new class from. Default is `RuntimeError`.
 *
 * @return {Class} The new error class.
 */
exports.define = function(newClassName, baseClass) {
  baseClass = baseClass || RuntimeError;

  let newErrorClass = (class Class extends baseClass {
    constructor (msg, status, details) {
      super(msg, status, details);
      this.name = newClassName;
      Error.captureStackTrace(this, newErrorClass);
    }
  });

  return newErrorClass;
};


