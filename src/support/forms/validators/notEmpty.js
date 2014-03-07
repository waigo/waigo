"use strict";

var validator = require('validator');

/** 
 * # Validator: check whether given value is non-empty.
 */

/**
 * Get the validator function.
 * @return {Function}
 */
module.exports = function() {
  return function*(form, field, value) {
    if (validator.isNull(value) || !validator.isLength(value, 1)) {
      throw new Error('Must not be empty');
    }
  }
};

