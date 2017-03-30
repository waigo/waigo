

const validator = require('validator')

const waigo = global.waigo,
  FieldValidationError = waigo.load('support/forms/field').FieldValidationError


/**
 * Validator which excutes a function from validator lib
 *
 * @throws Error If not an email address.
 */
module.exports = function (options) {
  const method = options.method,
    args = options.args

  args = args || []

  if (!validator[method]) {
    throw new FieldValidationError(`Invalid method: ${method}`)
  }

  return function *(context, field, value) {
    if (!validator[method].apply(validator, [value].concat(args))) {
      throw new FieldValidationError(`Validation failed: ${method}`)
    }
  }
}

