# Architecture

Waigo is built on top of [Koa](http://koajs.com) -  the spiritual successor to [Express](https://expressjs.com/) - and is itself written using ES6 technologies. Koa's ES6-based architecture allows for complex middleware patterns that aren't as easy to do in Express. 

If you are not already familiar with Express or Koa or have never written middleware in Node.js before then the sections below will get you upto speed.

## Middleware primer

If you have used Express before then the following code will be familiar to you:

```js
var express = require('express');
var app = express();

app.use(function ensureFormatSet(req, res, nect) {
  if (!req.query.format) {
    req.query.format = 'plain';
  }
  
  next();
});

app.use(function checkFormat(req, res, next) {
  // if "format=json" set then return as JSON
  if ('json' === req.query.format) {
    res.set('Content-Type', 'application/json');
  }
  
  next();
});

app.get('/', function serveContent(req, res) {
  res.send('Hello World!');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
```

We initialise a new Express app, setup a request middleware chain, and finally tell it to startup a HTTP server and listen on port 3000.

As you can see, each middleware is essentially a function which gets passed the current request object  (`req`), response object (`res`) and a callback (`next`) which points to the next middleware in the chain:

```js
function (req, res, next) { ... }
```

Within each middleware we have to remember to call `next()` so that the next middleware in the chain can be executed. But in what order are they executed? in the order in which they are defined. In the above example the middleware function will be executed in the following order:

1. `ensureFormatSet`
2. `checkFormat`
3. `serverContent`

The third of these only gets triggered for `GET` requests made to the root path (`/`), and as such it is defined differently (using `app.get()` rather than `app.use()`).

