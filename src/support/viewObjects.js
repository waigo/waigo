"use strict";


var waigo = require('../../'),
  _ = waigo._;



/**
 * The name of the method which when called will return a view object representation of the callee.
 * @type {String}
 */
var methodName = exports.methodName = 'toViewObject';




/**
 * Get yieldable for converting given object into a view object.
 *
 * @param {Object} ctx A request context.
 * @param  {*} inputObject The object.
 * @return A yieldable value.
 */
var toViewObjectYieldable = exports.toViewObjectYieldable = function(ctx, inputObject) {
  if (inputObject) {
    // if it's one of our model schema types
    // (see https://github.com/hiddentao/simple-mongo-schema)
    switch (inputObject) {
      case String:
        return 'String';
      case Boolean:
        return 'Boolean';
      case Number:
        return 'Number';
      case Date:
        return 'Date';
      case Object:
        return 'Object';
      case Array:
        return 'Array';
    }

    // has view object method
    if (inputObject[methodName]) {
      return inputObject[methodName].call(inputObject, ctx);
    }
    // is an array
    else if (_.isArray(inputObject)) {
      // recursive call on all children
      return inputObject.map(function(local) {
        return toViewObjectYieldable(ctx, local);
      });
    }
    // is an object
    else if (_.isPlainObject(inputObject)) {
      var yieldables = {};

      for (let idx in inputObject) {
        yieldables[idx] = toViewObjectYieldable(ctx, inputObject[idx]);
      }

      return yieldables;
    }
  }

  return inputObject;
};



