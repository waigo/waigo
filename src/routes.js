module.exports = {
  'GET /' : 'main.index',
};


/*
# Normal controllers

The following maps the `/` URL to the `index()` method on the controller at `controllers/main.js`.

```js
module.exports = {
 'GET /' : 'main.index'
};
```

This can also be written as:

```js
module.exports = {
 'GET /' : {
  controller: 'main.index'
 }
};

```

_Note: Supported request methods are: GET, POST, PUT, DEL, OPTIONS and HEAD_.

You can specify one or more middleware which should get run before running the controller method:

```js
module.exports = {
 'GET /' : ['accessControl', 'main.index']
};
```

_Note that when an array is provided, as above, the last item is always expected to be the controller method which is
meant to handle the request_.

You can also write the above as:

```js
module.exports = {
 'GET /' : {
    middleware: ['accessControl'],
    controller: 'main.index'
 }
};
```

In fact, you can even specify other controller methods as middleware:

```js
module.exports = {
  'GET /' : {
    middleware: ['accessControl', 'user.load'],
    controller: 'main.index'
  }
};
```

If a specified middleware item is in the form `module.methodName` then it is assumed to be a method on a controller.
Otherwise it is expected to be the name of a middleware module in the middleware folder.

For the above example, Waigo will process the request in the following order:

  - Load `support/middleware/acccessControl.js` and pass request to its
  - Load `controllers/user.js` and pass request to its `load` method
  - Load `controllers/main.js` and pass request to its `index` method

*/


