"use strict";

const validator = require('validator');


const waigo = global.waigo,
  { FieldValidationError } = waigo.load('support/field');


/**
 * Validator to check whether given email address is already in use.
 *
 * @throws Error If not an email address.
 */
module.exports = function() {
  return function*(context, field, value) {
    let numUsers = yield context.app.models.User.count({
      'emails.email': value
    });

    if (0 < numUsers) {
      throw new FieldValidationError('Email already in use');
    }
  }
};

