"use strict";


var _ = require('lodash'),
  waigo = require('../../../');


var errors = waigo.load('support/errors'),
  Field = waigo.load('support/forms/field').Field,
  viewObjects = waigo.load('support/viewObjects');




/** Form validation error. */
var FormValidationError = exports.FormValidationError = errors.define('FormValidationError', errors.MultipleError);


/**
 * Get view object representation of form validation error.
 *
 * This checks the `leanErrors` request flag. If set then the 
 * resulting view object will be simpler to analyse and iterate over.
 */
FormValidationError.prototype.toViewObject = function*(ctx) {
  if (!_.get(ctx, 'request.leanErrors')) {
    return yield errors.MultipleError.prototype[viewObjects.methodName].call(this, ctx);
  } else {
    var ret = yield errors.RuntimeError.prototype[viewObjects.methodName].call(this, ctx);
    ret.fields = {};

    for (let id in this.errors) {
      let fieldErrors = (yield this.errors[id][viewObjects.methodName](ctx)).errors;

      ret.fields[id] = [];

      for (let feId in fieldErrors) {
        ret.fields[id].push(fieldErrors[feId].msg)
      }
    }

    return ret;
  }
};



/**
 * Construct a form.
 *
 * Form field values get stored in an internal state object which can be retrieved 
 * and set at any time, thus allowing you to share state between `Form` instances 
 * as well as quickly restore a `Form` to a previously set state.
 *
 * @param {Object} ctx Current request context.
 * @param {Object|Form} config form configuration or an existing `Form` instance.
 * @param {Object} [state] The internal state to set for this form.
 * @constructor
 */
var Form = exports.Form = function(config, state) {
  if (config instanceof Form) {
    // passed-in state overrides existing form's state
    state = state || config.state;  
    config = config.config;
  }

  this.config = config;

  this._fields = {};
  for (let idx in this.config.fields) {
    let def = this.config.fields[idx];
    this._fields[def.name] = Field.new(this, def);
  }

  this.state = _.extend({}, state);
};




Object.defineProperty(Form.prototype, 'fields', {
  get: function() {
    return this._fields;
  }
});




Object.defineProperty(Form.prototype, 'state', {
  get: function() {
    return this._state;
  },
  set: function(state) {
    this._state = state || {};

    for (let fieldName in this.fields) {
      this._state[fieldName] = this._state[fieldName] || {
        value: undefined
      };
    }
  }
});





/**
 * Set values.
 *
 * This will sanitize each value prior to setting it.
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
 * Set original values.
 *
 * _Note: unlike when setting the current field values these values do not 
 * get sanitized_
 * 
 * @param {Object} values Mapping from field name to field original value.
 */
Form.prototype.setOriginalValues = function*(values) {
  values = values || {};

  for (let fieldName in this.fields) {
    this.fields[fieldName].originalValue = values[fieldName];
  }
};




/** 
 * Get whether this form is dirty.
 * 
 * @return {Boolean} True if any fields are dirty; false otherwise.
 */
Form.prototype.isDirty = function() {
  for (let fieldName in this.fields) {
    if (this.fields[fieldName].isDirty()) {
      return true;
    }
  }

  return false;
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
 *
 * @return {Object} Renderable plain object representation.
 */
Form.prototype[viewObjects.methodName] = function*(ctx) {
  var fields = this.fields,
    fieldViewObjects = {},
    fieldOrder = [];

  for (let idx in this.config.fields) {
    let def = this.config.fields[idx],
      field = fields[def.name];
      
    fieldViewObjects[def.name] = yield field[viewObjects.methodName](ctx);
    fieldOrder.push(def.name);
  }

  var ret = {
    fields: fieldViewObjects,
    order: fieldOrder
  }

  if (this.config.id) {
    ret.id = this.config.id
  }

  return ret;
};



// the form spec cache
var cache = {};


/** 
 * Create an instance of the given form.
 *
 * Although you can create and use `Form` objects directly it is better to use 
 * this static method as it handles the loading of form configuration from 
 * the `forms` module file path.
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
  var cachedSpec = cache[id];

  if (!cachedSpec) {
    cache[id]  = cachedSpec = waigo.load('forms/' + id);
    cachedSpec.id = id;
  }

  return new Form(cachedSpec, state);
};





