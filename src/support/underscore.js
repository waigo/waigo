"use strict";




/**
 * Get a deeply nested object property.
 *
 * @param {Object} obj The object.
 * @param {String} path The path within the object to fetch.
 * @param {*} fallbackValue The value to return if given path not found.
 *
 * @return {*} Returns value if found; otherwise the fallbackVAlue.
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


