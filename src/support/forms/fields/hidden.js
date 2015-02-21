"use strict";

var util = require('util'),
  waigo = require('../../../../'),
  _ = waigo._;


var Field = waigo.load('support/forms/field').Field;




/**
 * A hidden field.
 *
 * @param  {Form} form   Parent form
 * @param  {Object} config Configuration options
 * @constructor
 */
var Hidden = exports.Field = function(form, config) {
  Hidden.super_.apply(this, _.toArray(arguments));
};
util.inherits(Hidden, Field);



