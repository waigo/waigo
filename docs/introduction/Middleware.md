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
app.get('/', function serveContent(req, res) {
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

Let's go through what'

We initialise a new Express app, setup a request middleware chain, and finally tell it to start a HTTP server and listen on port 3000.

As you can see, each middleware is essentially a function which gets passed the current request object  (`req`), response object (`res`) and a callback (`next`) which points to the next middleware in the chain:

```js
function (req, res, next) { ... }
```

Within each middleware we have to remember to call `next()` so that the next middleware in the chain can be executed. But in what order are they executed? in the order in which they are defined. In the above example the middleware will be executed in the following order:

1. `ensureFormatSet`
2. `checkFormat`
3. `serverContent`

The third of these only gets triggered for `GET` requests made to the root path (`/`), and as such it is defined differently (using `app.get()` rather than `app.use()`).

## Koa middleware

Koa middleware functions are [generator functions](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Statements/function*). This immediately makes for powerful middleware composition. Let's take the previous example