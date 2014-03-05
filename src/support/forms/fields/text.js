"use strict";

var waigo = require('../../../../');


var Field = waigo.load('support/forms/fields/field').Field; 



/**
 * Create a text field.
 *
 * @constructor
 */
var Text = exports.Field = function(form, config) {
  Field.apply(this, _.toArray(arguments));
};
Text.inheritsFrom(Field);



