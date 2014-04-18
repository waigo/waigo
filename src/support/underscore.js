"use strict";


/**
 * Get a deeply nested object property.
 *
 * @param obj the object
 * @param path the path
 * @param fallbackValue value to return if not found.
 *
 * @return {*} defaultValue if not found
 */
exports.get = function(obj, path, fallbackValue) {
  var self = this;  // underscore

  if (self.isUndefined(obj) || null === obj) {
    return fallbackValue;
  }

  var fields = path.split('.'),
    result = obj;

  for (var i=0; i<fields.length; ++i) {
    if (!self.isObject(result) && !self.isArray(result)) {
      return fallbackValue;
    }

    result = result[fields[i]];
  }

  return result || fallbackValue;
};


