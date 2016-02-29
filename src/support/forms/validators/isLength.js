"use strict";

const waigo = global.waigo,
  _ = waigo._,
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
    let len = _.get(value, 'length', 0);
    let min = options.min || 0;
    let max = options.max || 10000000;

    if (min > len || max < len) {
      throw new FieldValidationError('Must be between ' 
        + options.min + ' and ' 
        + options.max + ' characters in length'
      );
    }
  }
};

