"use strict";

const waigo = global.waigo,
  _ = waigo._;


/**
 * Sanitizer to trim whitespace from the end of strings.
 * 
 * @return {Function} Sanitizaton function.
 */
module.exports = function() {
  return function*(field, value) {
    return (typeof value === 'string' ? _.trim(value) : value);
  }
};


