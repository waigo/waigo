


const waigo = global.waigo,
  _ = waigo._,
  FieldValidationError = waigo.load('support/forms/field').FieldValidationError



/**
 * Validator to check whether given value is non-empty.
 *
 * @return {Function} Validation function.
 */
module.exports = function () {
  return function *(context, field, value) {
    if (null === value 
        || undefined === value 
        || (typeof value === 'string' && !value.length)
    ) {
      throw new FieldValidationError('Must not be empty')
    }
  }
}

