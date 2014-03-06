"use strict";


var _ = require('lodash'),
  Promise = require('bluebird'),
  waigo = require('../../../');


var errors = waigo.load('support/errors'),
  Field = waigo.load('support/forms/field').Field,
  mixins = waigo.load('support/mixins');


/** 
 * # Forms
 *
 * This module provides a `Form` class which makes dealing with forms very easy. A `Form` instance points to numerous `Field` instances 
 * which are created based on a form definition object which is provided during form construction. A form stores its internal state 
 * (including current field values) within an object which can be retrieved at any time. Importantly, a form can have its internal state 
 * set at any time, allowing for a single `Form` instance to be re-used for multiple clients (where each client is associated with an 
 * internal state).
 *
 * Although you can create and use `Form` objects directly it is better to use the `Form.new()` static method as this internally keeps 
 * track of which forms have been initialised, making for easy instance re-use.
 */




/** @type {Error} A form validation error. */
var FormValidationError = exports.FormValidationError = errors.define('FormValidationError', errors.MultipleError);




/**
 * Construct a form.
 *
 * @param {Object} def form definition.
 * @constructor
 */
var Form = exports.Form = function(def) {
  this.config = def || {};
  this.state = {};
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
    if (!this._fields) {
      this._fields = {};

      for (let fieldName in this.config.fields) {
        let def = this.config.fields[fieldName];
        this.fields[fieldName] = Field.new(this, def);
      }
    }

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

    for (let fieldName in this.config.fields) {
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
  var fields = this.fields;

  values = values || {};

  for (let fieldName in fields) {
    yield fields[fieldName].setValue(values[fieldName]);
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
    let filed = fields[fieldName];

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
    fieldViewObjects = {};

  for (let fieldName in fields) {
    fieldViewObjects[fieldName] = yield fields[fieldName].toViewObject(ctx);
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
 * The given id is used to load in the form definition from the `forms` file path.
 * 
 * An optional initial internal state can also be provided to restore the form to 
 * a previously set state. If not provided then the form will be set to the default internal 
 * state of a newly constructed instance.
 *
 * @param {String} id The id of the form to load.
 * @param {Object} [state] The internal state to set for this form.
 * 
 * @return {Form}
 */
Form.new = function(id, state) {
  var form = cache[id];

  if (!form) {
    let def = waigo.load('forms/' + id);
    def.id = id;
    form = new Form(def);
    cache[id] = form;
  }

  form.state = state || {};

  return form;
};





