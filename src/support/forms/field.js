"use strict";

var _ = require('lodash'),
  waigo = require('../../../');


var errors = waigo.load('support/errors'),
  mixins = waigo.load('support/mixins');


/** 
 * # Form fields
 *
 * This module provides a base `Field` class for use with the `Form` class. Concrete instances of this class are never created - instead 
 * one of its subtypes will be instantiated depending on the type of field required.
 * 
 * A field is provided a reference to its parent form upon constructions - it uses this primarily to fetch a reference to 
 * the form's internal state object, as this is where fields also store their data (rather than within the `Field` instance). 
 * This makes it easier to re-use form instances for multiple clients.
 *
 * The `Field.new()` static method makes it easy to initialise a field of any given type and is the recommended method for creating 
 * new field instances.
 */





/** @type {Error} A field validation error. */
var FieldValidationError = exports.FieldValidationError = errors.define('FieldValidationError', errors.MultipleError);

/** @type {Error} A field sanitization error. */
var FieldSanitizationError = exports.FieldSanitizationError = errors.define('FieldSanitizationError');



/**
 * A form field.
 * 
 * @param  {Form} form   Parent form
 * @param  {Object} config Configuration options
 */
var Field = exports.Field = function(form, config) {
  this.form = form;
  this.config = config;

  this.sanitizers = _.map(config.sanitizers || [], function(def) {
    var id = def,
      options = {};

    if (_.isObject(def)) {
      id = def.id;
      options = def;
    }

    return {
      id: id,
      fn: waigo.load('support/forms/sanitizers/' + id)(options)
    };
  });

  this.validators = _.map(config.validators || [], function(def) {
    var id = def,
      options = {};

    if (_.isObject(def)) {
      id = def.id;
      options = def;
    }

    return {
      id: id,
      fn: waigo.load('support/forms/validators/' + id)(options)
    };
  });
};
mixins.applyTo(Field, mixins.HasViewObject);




Object.defineProperty(Field.prototype, 'value', {
  /**
   * Get the current value of this field.
   *
   * @return {Any}
   * @private
   */
  get: function() {
    return this.form.state[this.config.name];
  },
  /**
   * Set the current value of this field.
   *
   * @param {Any} value The value to set.
   * @private
   */
  set: function(value) {
    this.form.state[this.config.name] = value;
  }
});




/**
 * Set the value of this field.
 *
 * This will run the given value through all available sanitizers prior to actually setting it. Subclasses should override this method 
 * if they wish to perform any additional processing of the value.
 *
 * @param {Any} val The value.
 *
 * @throws FieldSanitizationError If any errors occur.
 */
Field.prototype.setValue = function*(val) {
  for (let idx in this.sanitizers) {
    let sanitizerFn = this.sanitizers[idx].fn;

    try {
      val = yield sanitizerFn(this.form, this, val);
    } catch (e) {
      throw new FieldSanitizationError(e.message);
    }
  }

  this.value = val;
};





/**
 * Validate this field's value.
 *
 * @throws FieldValidationError If validation fails.
 */
Field.prototype.validate = function*() {
  var errors = null;

  for (let idx in this.validators) {
    let validator = this.validators[idx];

    try {
      yield validator.fn(this.form, this, this.value);
    } catch (err) {
      if (!errors) {
        errors = {};
      }

      errors[validator.id] = err;
    }
  }

  if (errors) {
    throw new FieldValidationError('Field validation failed', 400, errors);
  }
};





/**
 * Get renderable representation of this field.
 *
 * @see mixins
 */
Field.prototype.toViewObject = function*() {
  var ret = {
    type: this.config.type,
    name: this.config.name,
    label: this.config.label,
    value: this.value
  };

  if (this.config.defaultValue) {
    ret.defaultvalue = this.config.defaultValue;
  }

  return ret;
};




/** 
 * Create a `Field` instance.
 *
 * This will load and intialise an instance of the correct `Field` subtype according to the given field definition.
 * 
 * @param {Form} form The parent form which holds this field's internal state.
 * @param {Object} def The field definition.
 * 
 * @return {Field}
 */
Field.new = function(form, def) {
  let type = def.type,
    FieldClass = waigo.load('support/forms/fields/' + type).Field;

  return new FieldClass(form, def);
};




