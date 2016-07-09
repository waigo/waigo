# Middleware

_Note: This section gives a short primer on middleware and how it works in Express and Koa. If you're already familiar with this you can skip to the next section._

Let's consider a basic Express application which prints _"Hello World!"_. Our application will expect the user to have passed in a secret string as a URL query parameter in order to work. If this query parameter is omitted we want the response to be an error.

Here is the code:

```js
var express = require('express');

// create new Express app instance
var app = express();

// middleware to check secret
app.use(function checkSecret(req, res, next) {
  if ('secretpassword' !== req.query.secret) {
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

Notice above that the second middleware function does not call `next()`. This is a _route handler_ middleware and is intended to handle all HTTP GET requests to the root URL path (`/`) and return a response. 

Typically you would define a route handler for every URL route in your app - using `app.get()`, `app.post()`, `app.put()`, etc according to the HTTP method you wish to specify. Furthermore, you would typically define these route handlers after defining middleware that is common to every route - using `app.use()`.



## Koa middleware

Koa middleware functions are [generator functions](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Statements/function*). This immediately makes for powerful middleware composition. Let's take the previous example