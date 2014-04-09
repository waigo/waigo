"use strict";


var _ = require('lodash'),
  waigo = require('../../../');


var errors = waigo.load('support/errors'),
  Field = waigo.load('support/forms/field').Field,
  mixins = waigo.load('support/mixins');


/** 
 * # Forms
 *
 * This module provides a `Form` class which makes dealing with forms very 
 * easy. A `Form` instance points to numerous `Field` instances which are 
 * created based on a form definition object which is provided during form 
 * construction. A form stores its internal state (including current field 
 * values) within an object which can be retrieved at any time. 
 * 
 * Importantly, a form can have its internal state changed at any time, 
 * thus allowing for 
 * multiple `Form` instances to share data (such as `Field` instances). This 
 * helps reduce memory usage when multiple clients are accessing and 
 * manipulating the same 
 * from on your site.
 *
 * Although you can create and use `Form` objects directly it is better to use 
 * the `Form.new()` static method as this internally keeps track of which forms 
 * have been initialised, making for easy instance re-use.
 */




/** @type {Error} A form validation error. */
var FormValidationError = exports.FormValidationError = errors.define('FormValidationError', errors.MultipleError);




/**
 * Construct a form.
 *
 * @param {Object|Form} config form configuration or an existing `Form` instance.
 * @param {Object} [state] The internal state to set for this form.
 * @constructor
 */
var Form = exports.Form = function(config, state) {
  if (config instanceof Form) {
    let existingForm = config;
    this.config = existingForm.config;
    this._fields = existingForm._fields;
  } else {
    this.config = config || {};
    // initialise fields
    this._fields = {};
    for (let idx in this.config.fields) {
      let def = this.config.fields[idx];
      this._fields[def.name] = Field.new(this, def);
    }
  }

  this.state = state || {};
};
mixins.applyTo(Form, mixins.HasViewObject);




Object.defineProperty(Form.prototype, 'fields', {
  /**
   * Get the fields of this form.
   *
   * Fields will be returned as `Field` instances.
   *
   * @return {Object} `String` -> `Field` mappings.
   */
  get: function() {
    return this._fields;
  }
});




Object.defineProperty(Form.prototype, 'state', {
  /**
   * Get the internal state of this form.
   *
   * @return {Object}
   */
  get: function() {
    return this._state;
  },
  /**
   * Set the internal state of this form.
   *
   * @param {Object} state The new internal state to set for this form.
   */
  set: function(state) {
    this._state = state || {};

    for (let fieldName in this.fields) {
      this._state[fieldName] = this._state[fieldName] || {
        value: null
      };
    }
  }
});





/**
 * Set field values.
 *
 * @param {Object} values Mapping from field name to field value.
 */
Form.prototype.setValues = function*(values) {
  values = values || {};

  for (let fieldName in this.fields) {
    yield this.fields[fieldName].setSanitizedValue(values[fieldName]);
  }
};




/**
 * Validate the contents of this form.
 *
 * @throws FormValidationError If validation fails.
 */
Form.prototype.validate = function*() {
  var fields = this.fields,
    errors = null;

  for (let fieldName in fields) {
    let field = fields[fieldName];

    try {
      yield field.validate();
    } catch (err) {
      if (!errors) {
        errors = {};
      }

      errors[fieldName] = err;
    }
  }

  if (errors) {
    throw new FormValidationError('Form validation failed', 400, errors);
  }
};





/**
 * Get renderable representation of this form.
 * @see mixins
 */
Form.prototype.toViewObject = function*(ctx) {
  var fields = this.fields,
    fieldViewObjects = [];

  for (let idx in this.config.fields) {
    let def = this.config.fields[idx];
      
    fieldViewObjects.push(yield fields[def.name].toViewObject(ctx));
  }

  var ret = {
    fields: fieldViewObjects
  }

  if (this.config.id) {
    ret.id = this.config.id
  }

  return ret;
};



// the form instance cache
var cache = {};


/** 
 * Create an instance of the given form.
 *
 * The given id is used to load in the form definition from the `forms` file 
 * path.
 * 
 * An optional initial internal state can also be provided. This is useful to 
 * e.g. restore the from and its fields to a previous state. If not provided 
 * then the form will be set to the default internal state of a newly 
 * constructed instance.
 *
 * @param {String} id The id of the form to load.
 * @param {Object} [state] The internal state to set for this form.
 * 
 * @return {Form}
 */
Form.new = function(id, state) {
  var cachedInstance = cache[id];

  if (!cachedInstance) {
    let config = waigo.load('forms/' + id);
    config.id = id;
    cachedInstance = new Form(config, state);
    cache[id] = cachedInstance;
    return cachedInstance;
  } else {
    return new Form(cachedInstance, state);
  }
};





