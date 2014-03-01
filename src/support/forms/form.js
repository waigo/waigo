'use strict';

var _ = require('lodash'),
  waigo = require('../../../'),
  Promise = require('bluebird'),
  Field = waigo.load('support/forms/field');


var errors = waigo.load('support/errors'),
  mixins = waigo.load('support/mixins');


/** @type {Error} A form validation error. */
var FormValidationError = exports.FormValidationError = errors.defineSubType(errors.MultipleError, 'FormValidationError');




/**
 * Construct a form.
 *
 * @param {Object} config form configuration.
 * @constructor
 */
var Form = exports.Form = function(config) {
  this.config = config || {};
};
mixins.extend(Form, mixins.HasViewObject);



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
      this.fields[fieldName] = Field.create(fieldName, this.config.fields[fieldName]);
    }
  }

  return this.fields;
};




/**
 * Set the contents of this form.
 *
 * @param {Object} fieldContents Mapping from field name to field value.
 */
Form.prototype.setContents = function*(formContents) {
  var fields = yield this.getFields();

  formContents = formContents || {};

  for (let fieldName in fields) {
    yield fields[fieldName].setValue(formContents[fieldName]);
  }
};




/**
 * Validate the contents of this form.
 *
 * @throws FormValidationErrors If validation fails.
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

  return {
    id: this.config.id,
    submitLabel: this.config.submitLabel || 'Submit',
    fields: fieldViewObjects
  }
};





