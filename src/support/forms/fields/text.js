"use strict";

var _ = require('lodash'),
  util = require('util'),
  waigo = require('../../../../');


var Field = waigo.load('support/forms/field').Field;



/**
 * Create a text field.
 *
 * @constructor
 */
var Text = exports.Field = function(form, config) {
  Text.super_.apply(this, _.toArray(arguments));
};
util.inherits(Text, Field);



