"use strict";


module.exports = function(_) {

  /**
   * Get a deeply nested object property.
   *
   * @param {Object} obj The object.
   * @param {String} path The path within the object to fetch.
   * @param {*} fallbackValue The value to return if given path not found.
   *
   * @return {*} Returns value if found; otherwise the fallbackVAlue.
   */
  _.mixin({
    get: function(obj, path, fallbackValue) {
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
    },

    pluralize: require('pluralize'),

    uuid: require('node-uuid'),

    emailFormat: function(type, obj) {
     switch (type) {
       case 'greet':
         var name = _.get(obj, 'profile.displayName') || _.get(obj, 'username', '');

         return name.length ? name : 'Hey';
         break;
     }

     return obj; 
    }
  });

};
