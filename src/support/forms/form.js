"use strict";


var _ = require('lodash'),
  Promise = require('bluebird'),
  waigo = require('../../../');


var errors = waigo.load('support/errors'),
  Field = waigo.load('support/forms/fields/field'),
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
 * Although you can create and use `Form` objects directly it is better to use the `.new()` method as this internally keeps 
 * track of which forms have been initialised, making for easy instance re-use.
 */




/** @type {Error} A form validation error. */
var FormValidationError = exports.FormValidationError = errors.defineSubType(errors.MultipleError, 'FormValidationError');




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




/**
 * Get the fields of this form.
 *
 * Fields will be returned as `Field` instances.
 *
 * @return {Object} `String` -> `Field` mappings.
 */
Form.prototype.getFields = function*() {
  if (!this.fields) {
    this.fields = {};

    for (let fieldName in this.config.fields) {
      this.fields[fieldName] = Field.new(this, this.config.fields[fieldName]);
    }
  }

  return this.fields;
};



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

      fields[fieldName].setInternalState(this._state[fieldName]);
    }    
  }
});





/**
 * Set field values.
 *
 * @param {Object} values Mapping from field name to field value.
 */
Form.prototype.setValues = function*(values) {
  var fields = yield this.getFields();

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
  var fields = yield this.getFields(),
    errors = null;

  for (let fieldName in fields) {
    try {
      yield fields[fieldName].validate();
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
Form.prototype.toViewObject = function*() {
  var fields = yield this.getFields(),
    fieldViewObjects = {};

  for (let fieldName in fields) {
    fieldViewObjects[fieldName] = yield fields[fieldName].validate();
  }

  var ret {
    submitLabel: this.config.submitLabel || 'Submit',
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
exports.new = function(id, state) {
  var def = waigo.load('forms/' + id);
  def.id = id;

  var form = cache[def.name];

  if (!form)
    form = new Form(def);
    cache[def.name] = form;
  }

  state = state || {};
  form.setInternalState(state);

  return form;
};





