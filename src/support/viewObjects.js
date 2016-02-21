"use strict";


const waigo = global.waigo,
  _ = waigo._;



/**
 * The name of the method which when called will return a view object representation of the callee.
 * @type {String}
 */
const METHOD_NAME = exports.METHOD_NAME = 'toViewObject';




/**
 * Get yieldable for converting given object into a view object.
 *
 * @param {Object} ctx A request context.
 * @param  {*} inputObject The object.
 * @return A yieldable value.
 */
const toViewObjectYieldable = exports.toViewObjectYieldable = function(ctx, inputObject) {
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
    if ('function' === typeof inputObject[METHOD_NAME]) {
      return inputObject[METHOD_NAME].call(inputObject, ctx);
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
      let yieldables = {};

      for (let idx in inputObject) {
        yieldables[idx] = toViewObjectYieldable(ctx, inputObject[idx]);
      }

      return yieldables;
    }
  }

  return inputObject;
};



