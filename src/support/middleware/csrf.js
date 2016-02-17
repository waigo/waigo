"use strict";


const csrf = require('koa-csrf');



/**
 * Build middleware for CSRF protection.
 *
 * This should be preceded by middleware: `sessions`.
 * 
 * Once this runs calling `this.csrf` for the first time on the koa request 
 * context will cause a new CSRF token to be generated.
 *
 * The `this.assertCSRF()` method will also be available.
 * 
 * @return {Function} middleware
 */
module.exports = function() {
  return csrf({
    // nullify middleware option
    middleware: function*(next) {
      yield* next;
    }
  });
};

