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
module.exports = function(options) {
  options = (options || {});
  
  let min = options.min,
    max = options.max;

  return function*(context, field, value) {
    value = Number(value);
    
    if ( (undefined !== min && value < min) 
          || (undefined !== max && value > max) ) {

      if (undefined !== min) {
        if (undefined !== max) {
          throw new FieldValidationError(`Must be between ${min} and ${max} inclusive`);
        } else {
          throw new FieldValidationError(`Must be greater than or equal to ${min}`);          
        }
      } else {
        throw new FieldValidationError(`Must be less than or equal to ${max}`);          
      }
    }
  }
};

