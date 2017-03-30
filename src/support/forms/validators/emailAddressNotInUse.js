



const waigo = global.waigo,
  FieldValidationError = waigo.load('support/forms/field').FieldValidationError;


/**
 * Validator to check whether given email address is already in use.
 *
 * @throws Error If not an email address.
 */
module.exports = function() {
  return function*(context, field, value) {
    let existingUser = yield context.App.models.User.getByEmail(value);

    if (existingUser) {
      throw new FieldValidationError('Email already in use');
    }
  }
};

