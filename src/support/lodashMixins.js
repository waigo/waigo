"use strict";


module.exports = function(_) {
  _.mixin({
    /**
     * Bind generator function to given context.
     * @param  {GeneratorFunction} genFn Generator function.
     * @param  {Object} ctx   Desired `this` context.
     * @return {GeneratorFunction}
     */
    bindGen: function(genFn, ctx) {
      return function*(...args) {
        return yield genFn.apply(ctx, args);
      };
    },
    /** 
     * Get whether given function is a generator function.
     *
     * @param {Function} fn A function.
     *
     * @return {Boolean} true if so; false otherwise.
     */
    isGen: function(fn) {
      var constructor = fn.constructor;

      if (!constructor) {
        return false;
      }

      if ('GeneratorFunction' === constructor.name || 'GeneratorFunction' === constructor.displayName) {
        return true;
      }

      return ('function' == typeof constructor.prototype.next && 'function' == typeof constructor.prototype.throw);
    },
    pluralize: require('pluralize'),
    uuid: require('node-uuid'),
    /**
     * Format user name for display within email.
     *
     * TODO: This method is confusing - clean it up!
     * 
     * @param  {String} type How to format.
     * @param  {User|String} obj  The user object or username string.
     * @return {*}
     */
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
