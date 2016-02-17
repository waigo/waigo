"use strict";

const validator = require('validator');



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
      throw new Error('Email already in use');
    }
  }
};

