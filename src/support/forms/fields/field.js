"use strict";

var _ = require('lodash'),
  waigo = require('../../../../');


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
 * The `.new()` static method makes it easy to initialise a field of any given type and is the recommended method for creating 
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

  this.defaultValue = config.defaultValue || '';

  this.sanitizers = _.map(config.sanitizers || [], function(def) {
    var id = def, 
      options = {};

    if (_.isObject(def)) {
      id = def.id;
      options = def;
    }

    return waigo.load('support/sanitizers/' + id)(options);
  });

  this.validators = _.map(config.validators || [], function(def) {
    var id = def, 
      options = {};

    if (_.isObject(def)) {
      id = def.id;
      options = def;
    }

    return waigo.load('support/validators/' + id)(options);
  });
};
mixins.applyTo(Form, mixins.HasViewObject);




Object.defineProperty(Form.prototype, '_value', {
  /**
   * Get the current value of this field.
   *
   * @return {Object}
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
  for (let sanitizer in this.sanitizers) {
    try {
      val = yield sanitizer.process(val);      
    } catch (e) {
      throw new FieldSanitizationError(e.message);
    }
  }

  this._value = val;
};





/**
 * Validate this field's value.
 *
 * @throws FieldValidationError If validation fails.
 */
Field.prototype.validate = function*() {
  var errors = null;

  for (let validator in this.validators) {
    try {
      yield validator(this._value);
    } catch (err) {
      if (!errors) {
        errors = {};
      }

      errors[fieldName] = err;
    }
  }

  if (errors) {
    throw new FieldValidationError('Form validation failed', 400, errors);
  }
};





/**
 * Get renderable representation of this field.
 *
 * @see mixins
 */
Field.prototype.toViewObject = function*() {
  return {
    type: this.config.type,
    name: this.config.name,
    value: this._value
  }
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
exports.new = function(form, def) {
  let type = def.type,
    FieldClass = waigo.load('support/forms/fields/' + type).Field;

  return new FieldClass(form, def);
};




