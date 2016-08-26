# Setting the output format

The default output format is according to what is set within the configuration - the [default configuration](Enabling.md) sets it to HTML. To change the output format for a given request simply pass in the configured URL query parameter with the desired format at its value.

The default query parameter is `format`. Thus, if we wish for a route to return JSON output you would call it with `?format=json` as the URL query parameter.

However, you can also set the output format programmatically, overriding the value set via query parameter.

```js
// file: <project folder>/src/controllers/user.js

exports.showProfile = function*() {
  // enforce JSON output format
  this.request.outputFormat = 'json';
  
  yield this.render('profile', {
    username: 'john',
    age: 23
  }})
}
```

The above controller method set the output format to JSON, thus overriding the selection set via the `format` query parameter.

## Set it via middleware

Being able to programmatically set the output format enables you to write middleware which enforces a certain output format and then apply that middleware to any route of your choosing. For example, let's say we want all the routes under the `/api` path to always return JSON. First let's build the middleware:

```js
// file: <project folder>/src/support/middleware/enforceOutputFormat.js

module.exports = function(options) {
  return function*(next) {
    this.request.outputFormat = options.format;
    
    yield next;
  }
}
```

Now we can apply it to routes as we see fit and know that those routes will always respond using the given specific output format:

```js
// file: <project folder>/src/routes/index.js

module.exports = {
  '/': {
    GET: 'index.main'
  },
  '/api': {
    // All routes under API will output JSON
    pre: [ { id: 'enforceOutputFormat', format: 'json' }],
    '/register': {
      POST: 'user.register_submit'
    },
    ...
  },
};
```
