"use strict";

var validator = require('validator');


module.exports = function() {
  return function*(form, field, value) {
    if (validator.isNull(value) || !validator.isLength(value, 1)) {
      throw new Error('Must not be empty');
    }
  }
};

