"use strict";

var _ = require('lodash'),
  util = require('util'),
  waigo = require('../../../../');


var Field = waigo.load('support/forms/field').Field;




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

      if (undefined === options[val]) {
        throw new Error('Must be one of: ' + _.values(options).join(', '));
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




