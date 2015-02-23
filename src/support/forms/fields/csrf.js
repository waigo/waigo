"use strict";

var util = require('util'),
  waigo = require('../../../../'),
  _ = waigo._;


var HiddenField = waigo.load('support/forms/fields/hidden').Field;



/**
 * A CSRF field.
 *
 * @param  {Form} form   Parent form
 * @param  {Object} config Configuration options
 * @constructor
 */
var CSRF = exports.Field = function() {
  CSRF.super_.apply(this, _.toArray(arguments));

  this._addValidator(
    function* checkCSRF(context, field, value) {
      try {
        context.assertCSRF(value);
      } catch (err) {
        throw new Error('Token check failed');
      }
    }
  );
};
util.inherits(CSRF, HiddenField);


/**
 * @override
 */
CSRF.prototype.toViewObject = function*(ctx) {
  var ret = yield HiddenField.prototype.toViewObject.call(this, ctx);

  ret.type = 'hidden';
  ret.value = ctx.csrf;

  return ret;
};



