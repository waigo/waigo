"use strict";

const validator = require('validator');

const waigo = global.waigo,
  FieldValidationError = waigo.load('support/forms/field').FieldValidationError;



/**
 * Validator to check whether given string is at least of given length.
 *
 * @param options {Object} Options.
 * @param options.min {Object} Minimum length.
 * @param options.max {Object} Maximum length.
 * 
 * @throws Error If not an email address.
 */
module.exports = function(options = {}) {
  return function*(context, field, value) {
    options.min = options.min || 0;
    options.max = options.max || 10000000;

    if (!validator.isLength(value, options.min, options.max)) {
      throw new FieldValidationError('Must be between ' 
        + options.min + ' and ' 
        + options.max + ' characters in length'
      );
    }
  }
};

