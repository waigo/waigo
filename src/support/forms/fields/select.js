"use strict";

var util = require('util'),
  waigo = require('../../../../'),
  _ = waigo._;


var Field = waigo.load('support/forms/field').Field;



var _arrayToStr = function(arr) {
  return _.map(arr, function(v) {
    return '' + v;
  });
}



/**
 * A select field.
 *
 * @param  {Form} form   Parent form
 * @param  {Object} config Configuration options
 * @constructor
 */
var Select = exports.Field = function(form, config) {
  Select.super_.apply(this, _.toArray(arguments));

  // default validator
  this.validators.unshift({
    id: 'validOption',
    fn: function*(field, val) {
      var options = yield field.getOptions();

      if (!_.isArray(val)) {
        val = [val];
      }

      val = _arrayToStr(val);
      var expected = _arrayToStr(_.keys(options));

      var diff = _.difference(val, expected);
      
      // if unknown option given OR if more than one given for a non-multiple select
      if (diff.length || (1 < val.length && !field.config.multiple)) {
        var str = field.config.multiple ? 'one or more of' : 'one of';

        throw new Error('Must be ' + str + ': ' + _.values(options).join(', '));
      }
    }
  });

};
util.inherits(Select, Field);



/**
 * Get selectable options to show to user.
 *
 * @return {Object} key-value pairs representing options.
 */
Select.prototype.getOptions = function*() {
  if (this.config.options instanceof Function) {
    return yield this.config.options();
  } else {
    return this.config.options;
  }
};




/**
 * @override
 */
Select.prototype.toViewObject = function*(ctx) {
  var ret = yield Field.prototype.toViewObject.call(this, ctx);

  ret.options = yield this.getOptions();

  return ret;
};




