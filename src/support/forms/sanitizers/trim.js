"use strict";

var validatorSanitizer = require('validator');


/**
 * Sanitizer to trim whitespace from the end of strings.
 * 
 * @return {String}
 */
module.exports = function() {
  return function*(form, field, value) {
    return validatorSanitizer.trim(value);
  }
};


