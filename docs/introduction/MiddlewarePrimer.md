# Middleware primer

_Note: This section gives a short primer on middleware and how it works in Express and Koa. If you're already familiar with this you can skip to the next section._

Let's consider a basic Express application which prints _"Hello World!"_. Our application will expect the user to have passed in a secret string as a URL query parameter in order to work. If this query parameter is omitted we want the response to be an error.

Here is the code:

```js
var express = require('express');

// create new Express app instance
var app = express();

// middleware to check secret
app.use(function checkSecret(req, res, next) {
  if ('waigo' !== req.query.secret) {
    next(new Error('Wrong secret!'));
  } else {
    next();
  }
});

// middleware to serve up content
app.get('/', function serveContent(req, res, next) {
  res.send('Hello World!');
});

// middleware to handle errors
app.use(function handleError(err, req, res, next) {
  res.send(err.toString());
});

// last step - kickstart the HTTP listening server
app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
```

As you can see, each middleware is essentially a function which gets passed the current request object  (`req`), response object (`res`) and a callback (`next`) which points to the next middleware in the chain:

```js
function(req, res, next) { ... }
```

However the error handling middleware is special, and gets an additional `err` argument at the beginning:

```js
function(err, req, res, next) { ... }
```

Each middleware function must call `next()` in order for the next middleware in the chain to execute. If `next()` is called with an error object (like we do above if the `secret` query value is incorrect) then Express will skip subsequent middleware functions until it finds the available error handling middleware.

Notice above that the second middleware function does not call `next()`. This is a _route handler_ middleware and is intended to handle all HTTP GET requests to the root URL path (`/`) and return a response. Because it doesn't call `next()` any middleware defined after this one wouldn't normally get executed.

At this point you may be wondering - why do we need an error handler middleware for the above logic? surely we can do it all in the route handler, like so:

```js
app.get('/', function serveContent(req, res, next) {
  if ('waigo' !== req.query.secret) {
    res.send('Error: Wrong secret!');
  } else {
    res.send('Hello World!');
  }
});
```

Absolutely. The original example is deliberately more complex just so that we can illustrate the concepts better. In the original example, the secret-checking middlware will be executed for every incoming request. The error handler middleware will handle errors propagated from any middleware further up the chain.

A note regarding route handlers. Typically you will define a route handler for every URL route in your app - using `app.get()`, `app.post()`, `app.put()`, etc according to the HTTP method you wish to specify. Furthermore, you would typically define these route handlers after defining middleware that is common to every route - using `app.use()`.


## Koa middleware

Let's now look at how middleware in Koa is different from and improves upon what's in Express.

Koa middleware functions are [generator functions](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Statements/function*). This immediately makes for powerful middleware composition. Rewriting the previous example in Koa gives us:

```js
const koa = require('koa');

// create new koa app
const app = koa();

// error handler first!
app.use(function*(next) {
  try {
    yield next;
  } catch (err) {
    this.response.send(err.toString());
  }
});

// middleware to check the secret
app.use(function*(next) {
  if ('waigo' !== this.request.query.secret) {
    throw new Error('Wrong secret!');
  }
  
  yield next;
});

// route handler
app.get(function*() {
  this.response.body = 'Hello world!';
});
```

Notice the simpler middleware function signatures. In Koa each middleware function's calling context is set dynamically at runtime. The [context](http://koajs.com/#context) internally has references to the active `request` and `response` objects.

The `next` callback is still used. However, because it is also a generator function it is `yield`-ed in order to be executed. This allows for an interesting emergent property - a Koa middleware function can pause execution, allow for other middleware further down the chain to execute, and then resume executing at a later point.

We see this most clearly with the error handling middleware, which is now the first in the chain:

```js
app.use(function*(next) {
  try {
    // execute the next middleware in the chain
    yield next;
    // if no errors get thrown then we end up here
  } catch (err) {
    // if errors get thrown we end up here
    this.response.send(err.toString());
  }
});
```

And notice how we don't need to pass errors to the `next` callback - we can just `throw` them instead, like we do in the secret-checking middleware. 

Perhaps we want to add middleware which compresses all response output before sending it down. We could add it after the error handler middleware as such:

```js
app.use(function*(next) {
  // execute remainder of chain first
  yield next;
  
  // if response is set
  if (this.response.body) {
    // compress it
    this.response.body = compress(this.response.body);
  }
});
```

To accomplish the above in Express we would need for the compression middleware to override the `res` object data writing methods, a hacky solution compared to the one above.

Thus Koa's middleware architecture based on generators gives us the following key benefits:

* Complex middleware composition (i.e. where execution jumps back and forth) is possible, allowing for complex logic to elegantly expressed.
* Throwing and handling errors is simpler to do in Koa.

Additionally, since Koa middleware are generator functions we can internally `yield` promises, thunks and other asynchronous objects, enabling us to write asynchronous code elegantly without callbacks.

## Waigo builds on Koa

Waigo route handlers and middleware functions work identically to Koa's, except that you the middleware function context also holds references to other parts of your Waigo app.

Here is an example route handler taken from Waigo's source code. This handler marks a user's email address as verified (after they've clicked a link we've sent to them via email):

```js
exports.verify_email = function*() {
  let action = yield this.App.actionTokens.process(
    this.request.query.c, {
      type: 'verify_email'
    }
  );
  
  this.logger.debug('Verify email address', action.user.id, action.data.email);

  // verify email address
  yield action.user.verifyEmail(action.data.email);

  // log the user in
  yield action.user.login(this);

  yield this.render('index', {
    alert: 'Your email address has been verified'
  });
};
```

You'll notice the handler context object has a no. of properties not present in Koa - `this.App`, `this.logger`, `this.render`, etc. We'll go over each of these in more detail in later sections of this guide. 



