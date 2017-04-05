const waigo = global.waigo,
  FieldValidationError = waigo.load('forms/support/field').FieldValidationError



/**
 * Validator to check whether given value is non-empty.
 *
 * @return {Function} Validation function.
 */
module.exports = function () {
  return function *(context, field, value) {
    if (null === value || undefined === value || (typeof value === 'string' && !value.length)) {
      throw new FieldValidationError('Must not be empty')
    }
  }
}
