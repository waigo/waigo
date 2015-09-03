"use strict";

var util = require('util'),
  waigo = global.waigo,
  _ = waigo._;


var Field = waigo.load('support/forms/field').Field;




/**
 * A text field.
 * @constructor
 */
var Text = exports.Field = function() {
  Text.super_.apply(this, _.toArray(arguments));
};
util.inherits(Text, Field);



