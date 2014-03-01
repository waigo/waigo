var _ = require('lodash');


/**
 * Mixin for objects which are able to provide a representation of themselves suitable rendering in a response.
 * @type {Mixin}
 */
var HasViewObject = exports.HasViewObject = {
  /**
   * Get render-able representation of this object.
   * @param {Object} ctx The context within which this object will be rendered. This is usually the same as the koa application context and 
   * is provided in case the view object structure needs to differ based on context.
   * @type {Object} a plain Javascript object.
   */
  toViewObject: function*(ctx) {
    throw new Error('Not yet implemented');
  }
};


/**
 * Extend given base class with mixins.
 *
 * @param {Class} baseClass The base class to apply mixins to.
 * @param {Class} mixin The first mixin to apply (each argument following this is another mixin).
 */
exports.extend = function(baseClass, mixin) {
  var mixins = _.toArray(arguments).slice(1);

  _.each(mixins, function(mixin) {
    _.each(mixin, function(prop, name) {
      if (_.isFunction(prop) && !((baseClass).prototype.hasOwnProperty(name)) ) {
        (baseClass).prototype[name] = prop;
      }
    });
  });
};


