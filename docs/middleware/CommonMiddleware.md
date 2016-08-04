# Common middleware

If a given middleware is being initialised during [startup](#startup-and-shutdown) (i.e. see below) then
additional options from the `app.config.middleware.ALL` configuration object get
passed to the middleware initializer:

```javascript
// file: <app folder>/src/config/base.js
module.exports = function(config) {
  ...
  config.middleware.ALL = {
    /* Order in which middleware gets run */
    _order: [
      'errorHandler',
      'staticResources',
    ],
    /* Options for each middleware */
    errorHandler: {},
    staticResources: {
      // relative to app folder
      folder: '/static',
    },
  };
  ...
}
```

Given the above configuration, the `staticResources` middleware initializer will get passed the options: `{ folder: '/static' }`.



## Common middleware

The [app configuration](#configuration) file may specify middleware that applies to all incoming requests. For example:

```javascript
// file:  <app folder>/src/config/base.js

module.exports = function(config) {
  ...
  config.middleware = {};

  config.middleware.ALL = {
    _order: [
      'errorHandler',
    ],
  };

  config.middleware.POST = config.middleware.PUT = {
    _order: [
      'bodyParser',
    ],
    bodyParser: {
      limit: '16mb',
    },
  };
  ...
};
```

The above configuration states that:

* The `errorHandler` middleware will apply to _all_ incoming requests. 
* The `bodyParser` middlware will only apply to incoming requests using the `PUT` and `POST` HTTP methods.

Once a request has been processed by common middleware the middleware specific to the trigger [route](#routing) will be executed.


# Controllers

Controllers in Waigo expose route handling methods which work as they do in koa.
The default `index` controller simply has:

```javascript
// file: <waigo framework>/src/controllers/index

"use strict";

exports.main = function*(next) {
  yield this.render('index');
};
```

A controller must either send some output or pass control to the `next`
middleware in the request chain. The `this.render()` call is provided by the 
[output formats](#views-and-output-formats) middleware.

Controllers can be nested within subfolders within the `controllers` path. For example, Waigo's default [admin dashboard](#admin-dashboard) controllers are located at:

* `<waigo npm folder>/src/controllers/admin/index.js`
* `<waigo npm folder>/src/controllers/admin/routes.js`
* ...

So to load the admin `routes` controller:

```javascript
waigo.load('controllers/admin/routes');
```
