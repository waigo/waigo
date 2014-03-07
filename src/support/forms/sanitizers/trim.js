"use strict";

var validator = require('validator');

/** 
 * # Sanitizer: trim whitespace from the ends of given string.
 */


/**
 * Get the sanitizer function.
 * @return {Function}
 */
module.exports = function() {
  return function*(form, field, value) {
    return validator.trim(value);
  }
};


