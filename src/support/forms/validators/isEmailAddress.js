"use strict";

var validator = require('validator');


/** 
 * # Validator: check whether given string represents an email address.
 */



/**
 * Get the validator function.
 * @return {Function}
 */
module.exports = function() {
  return function*(form, field, value) {
    if (!validator.isEmail(value)) {
      throw new Error('Must be an email address');
    }
  }
};

