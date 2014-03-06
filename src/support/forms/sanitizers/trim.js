"use strict";

var validator = require('validator');


module.exports = function() {
  return function*(form, field, value) {
    return validator.trim(value);
  }
};
