"use strict";

var _ = require('lodash'),
  util = require('util'),
  waigo = require('../../../../');


var Field = waigo.load('support/forms/field').Field;

/** 
 * # Text fields
 *
 * This module provides a class for reperesenting text input fields. It derivces from  the base `Field` class.
 */




/**
 * Create a text field.
 *
 * @param  {Form} form   Parent form
 * @param  {Object} config Configuration options
 * @constructor
 */
var Text = exports.Field = function(form, config) {
  Text.super_.apply(this, _.toArray(arguments));
};
util.inherits(Text, Field);



