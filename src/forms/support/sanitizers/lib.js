const validator = require('validator')

const waigo = global.waigo,
  FieldValidationError = waigo.load('forms/support/field').FieldValidationError


/**
 * Sanitizer which excutes a function from valiator lib
 */
module.exports = function (options) {
  const method = options.method
  let args = options.args

  args = args || []

  if (!validator[method]) {
    throw new FieldValidationError(`Invalid method: ${method}`)
  }

  return function *(field, value) {
    return validator[method].apply(validator, [value].concat(args))
  }
}
