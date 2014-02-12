/**
 * # Route mapping
 * 
 * This module maps URLs to handlers.
 *
 * The default module maps the `/` URL to the `index()` method on the [`main` controller](controllers/main.js.html):
 *
 * ```js
 * module.exports = {  
 *  'GET /' : 'main.index'
 *  };
 * ```
 * _Note: Supported request methods are: GET, POST, PUT, DEL, OPTIONS and HEAD_.
 *
 * You can specify one or more middleware which should get run before running the controller method:
 * ```js
 * module.exports = {
 *  'GET /' : ['accessControl', 'main.index']
 * };
 * ```
 *
 * As you can see, if the middleware name has a period (`.`) within it it assumed to refer to a `controller.method`. Otherwise 
 * it is assumed to be the name of a [middleware](support/middleware) module.
 *
 * If you want you can even specify other controller methods to act as middleware. Waigo doesn't care as long as the specified 
 * references actually exist:
 * 
 * ```js
 * module.exports = {
 *  'GET /' : ['accessControl', 'user.load', 'main.index']
 * };
 * ```
 *
 * For the above example, Waigo will process the request in the following order:
 * 
 * - Load `support/middleware/acccessControl.js` and pass request to its exported method
 * - Load `controllers/user.js` and pass request to its `load` method
 * - Load `controllers/main.js` and pass request to its `index` method
 * 
 * For routes which handle user-submitted data you may wish to enable the [`bodyParser`](support/bodyParser.js.html) and 
 * [`csrf`](support/csrf.js.html) middleware layers. Additional middleware layers can be found in NPM.
 */

/**
 * Default route mapping.
 * @type {Object}
 */
module.exports = {
  'GET /' : 'main.index'
};


