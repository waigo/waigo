"use strict";


/**
 * # Route map
 *
 * This maps URL routes to handler methods.
 *
 * _Note: Supported request methods are: `GET`, `POST`, `PUT`, `DEL`, `OPTIONS` and `HEAD`_
 *
 * You can specify one or more middleware which should get run before running
 * the controller method:
 *
 * ```javascript
 * module.exports = { 
 *   'GET /' : ['accessControl', 'main.index'] 
 * };
 * ```
 *
 * As you can see, if the middleware name has a period (`.`) within it it
 * is assumed to refer to a `controller`.`method` combination.
 * Otherwise it is assumed to be the name of a [middleware](#middleware) module file.
 *
 * The order in which they're specified determines the order in which they get 
 * executed at runtime.
 *
 * An example...
 * 
 * ```javascript
 * module.exports = { 
 *   'GET /' : ['accessControl', 'user.load', 'main.index'] 
 * };
 * ```
 *
 * For the above example, Waigo will process the request in the following
 * order:
 *
 * - Load `support/middleware/acccessControl.js` and pass request to its exported method
 * - Load `controllers/user.js` and pass request to its `load` method 
 * - Load `controllers/main.js` and pass request to its `index` method
 *
 * If you wish to initialise a particular middleware with options then you can
 * specify it as an object. For example:
 *
 * ```javascript
 * module.exports = { 
 *   'POST /signup' : [ { id: 'bodyParser', limit: '1kb' }, 'main.signup' ] 
 * };
 * ```
 *
 * For the above configuration an instance of the `bodyParser` middleware will 
 * get initialized for this route with the request body size limit set to `1KB`.
 */
module.exports = {
  
};


