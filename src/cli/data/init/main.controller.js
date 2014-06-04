"use strict";



/**
 * This is the default controller method, the handler for the default [default route](../routes.js.html).
 *
 * All controller methods are Koa middleware methods and behave in the same way.
 * 
 * @param {Function} next Koa middleware chain callback.
 */
exports.index = function*(next) {
  yield this.render('index', {
    title: 'Hello Waigo!'
  });
};


