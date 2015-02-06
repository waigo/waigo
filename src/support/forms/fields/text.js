"use strict";

var util = require('util'),
  waigo = require('../../../../'),
  _ = waigo._;


var Field = waigo.load('support/forms/field').Field;




/**
 * A text field.
 *
 * @param  {Form} form   Parent form
 * @param  {Object} config Configuration options
 * @constructor
 */
var Text = exports.Field = function(form, config) {
  Text.super_.apply(this, _.toArray(arguments));
};
util.inherits(Text, Field);



