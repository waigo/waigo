"use strict";


/**
 * # Default controller
 *
 * This is the default controller, designed to serve the [default route](../routes.js.html).
 */


/**
 * A controller method.
 *
 * Controller methods are Koa middleware and as such must be Generator functions.
 *
 * @param {Function} next middleware chain callback.
 */
exports.index = function*(next) {
  yield this.render('index', {
    title: 'Hello world!'
  });
};


