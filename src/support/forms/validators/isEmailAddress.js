"use strict";

var validator = require('validator');


module.exports = function() {
  return function*(form, field, value) {
    if (!validator.isEmail(value)) {
      throw new Error('Must be an email address');
    }
  }
};

