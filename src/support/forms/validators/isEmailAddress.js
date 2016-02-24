"use strict";

const validator = require('validator');

const waigo = global.waigo,
  FieldValidationError = waigo.load('support/field').FieldValidationError;


/**
 * Validator to check whether given string represents an email address.
 *
 * @throws Error If not an email address.
 */
module.exports = function() {
  return function*(context, field, value) {
    if (!validator.isEmail(value)) {
      throw new FieldValidationError('Must be an email address');
    }
  }
};

