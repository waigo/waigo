# Defining middleware

All middleware is defined in files under the `src/support/middleware` path. If you write your own middleware it should also be stored under this path.

Each middleware file is expected to expose a single _initializer_ function which, when called, will return a generator function which is the actual middleware function. 

For example:

```javascript
// file: <project folder>/src/support/middleware/example.js

module.exports = function(App, options) {
  return function*(next) {
    // do nothing and pass through
    yield next;
  };
};
```

The above middleware doesn't do anything and simply passes control to the next handler in the current request's middleware chain.

If we wanted to catch and handle any errors thrown by subsequent handlers in the chain we could do:

```javascript
module.exports = function(App, options) {
  return function*(next) {
  	try {
	  yield next;
  	} catch (err) {
  	  console.error(err);
	}
  };
};
```

Middleware functions in Waigo work in the same way as ones in Koa, in that they have a defined context and associated `request` and `response` objects:

```javascript
module.exports = function(App, options) {
  return function*(next) {
  	console.log(`URL: ${this.request.url}`);    
	
	this.response.body = 'Hello world!';
  };
};
```

Thus, existing Koa middleware functions can be re-used very easily within Waigo.

## App object 

Middleware functions in Waigo also have access to your application's `App` object, which is set on the context as well as being passed in during the construction phase:


```javascript
module.exports = function(App, options) {
  return function*(next) {
  	console.log(`Running in mode: ${this.App.config.mode}`);    
  	
	yield next;  	
  };
};
```
