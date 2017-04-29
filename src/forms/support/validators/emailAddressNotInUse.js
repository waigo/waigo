const waigo = global.waigo,
  FieldValidationError = waigo.load('forms/support/field').FieldValidationError


/**
 * Validator to check whether given email address is already in use.
 *
 * @throws Error If not an email address.
 */
module.exports = function () {
  return function *(context, field, value) {
    const existingUser = yield context.App.users.getByEmail(value)

    if (existingUser) {
      throw new FieldValidationError('Email already in use')
    }
  }
}
