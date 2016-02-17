"use strict";

const validatorSanitizer = require('validator');


/**
 * Sanitizer to trim whitespace from the end of strings.
 * 
 * @return {Function} Sanitizaton function.
 */
module.exports = function() {
  return function*(field, value) {
    return validatorSanitizer.trim(value);
  }
};


