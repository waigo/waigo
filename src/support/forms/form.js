var _ = require('lodash'),
  waigo = require('../../../'),
  Promise = require('bluebird'),
  Field = waigo.load('support/forms/field');


var BaseError = waigo.load('support/errors').BaseError;


/** @type {Error} A form validation error. */
var FormValidationError = exports.FormValidationError = BaseError.createSubType('FormValidationError');




/**
 * Construct a form.
 *
 * @param {Object} config form configuration.
 * @constructor
 */
var Form = exports.Form = function(config) {
  this.config = config || {};
};



/**
 * Get the fields of this form.
 *
 * Fields will be returned as `Field` instances.
 *
 * @return {Object} `String` -> `Field` mappings.
 */
Form.prototype.getFields = function*() {
  if (!this._fields) {
    this._fields = {};

    for (fieldName in this.config.fields) {
      this._fields[fieldName] = Field.create(fieldName, this.config.fields[fieldName]);
    }
  }

  return this._fields;
};




/**
 * Set the contents of this form.
 *
 * @param {Object} fieldContents Mapping from field name to field value.
 */
Form.prototype.setContents = function*(formContents) {
  var fields = yield this._getFields();

  formContents = formContents || {};

  for (fieldName in fields) {
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

  for (fieldName in fields) {
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
    throw new FormValidationError(errors);
  }
};





/**
 * Get render-able representation of this form.
 *
 * Output will include values for form fields.
 *
 * @return {Promise} resolves to JSON object
 */
Form.prototype.toViewObject = function*() {
  var fields = yield this.getFields(),
    fieldViewObjects = {};

  for (fieldName in fields) {
    fieldViewObjects[fieldName] = yield fields[fieldName].validate();
  }

  return {
    id: self.config.id,
    submitLabel: self.config.submitLabel || 'Submit',
    fields: fieldViewObjects    
  }
};





