"use strict";

const validator = require('validator');


const waigo = global.waigo,
  FieldValidationError = waigo.load('support/forms/field').FieldValidationError;



/**
 * Validator to check whether given value is non-empty.
 *
 * @return {Function} Validation function.
 */
module.exports = function() {
  return function*(context, field, value) {
    if (validator.isNull(value) || !validator.isLength(value, 1)) {
      throw new FieldValidationError('Must not be empty');
    }
  }
};

