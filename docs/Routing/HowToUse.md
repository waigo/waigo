# How to use

Waigo's router provides a user-friendly mapping syntax, per-route middleware customisation, and the ability to have _"sub paths"_ to any level.

Routes are specified in files under the `routes/` path and are processed once by the `routes` [startup step](../app_configuration/StartupSteps.md). 

An example:

```javascript
"use strict";

module.exports = { 
  '/admin': {
    pre: [
      'assertUser',
      'admin.index.configureMenu',
    ],

    GET: 'admin.index.main',

    '/routes': {
      pre: [
        { 
          id: 'assertUser', 
          canAccess: 'admin',
        },
      ],

      GET: 'admin.routes.index'
    },
    
    ...
	}
};
```

_Note: Parameterized and pattern-matched routing is also supported. See [trie-router](https://github.com/koajs/trie-router) for more information._

The above route mapping specifies the following:

* The base path is `/admin`
  *  All requests to URLs beginning with `/admin` will be served by this route mapping configuration.
* The `/admin` path and all of its subpaths will have 2 common middleware applied:
  * `waigo.load('support/middleware/assertUser')`  - will check that the user is logged in.
  * `waigo.load('controllers/admin/index').configureMenu)` - will configure the admin menu for rendering.
* `GET /admin` will be handled by `waigo.load('controllers/admin/index').main`.
* The `/admin/routes` path and all of its subpaths will have 1 common middlware applied:
  * `waigo.load('support/middleware/assertUser')({canAccess: 'admin'})` - will check that the user is an admin.
* `GET /admin/routes` will be handled by  `waigo.load('controllers/admin/routes').index`.


In general, if the middleware name has periods (`.`) within it then it is assumed to
refer to a controller (under `src/controllers`), and the part of the last period is is assumed to be the name of the method within the controller which should handle the request. If the middleare name has not periods in it then then it is assumed to be the name of a middleware file (under `src/support/middleware`).

If we wanted to we could also specify more than one middleware (i.e. a chain) for a particular individual route and HTTP method, e.g we can rewrite the above route mappings as follows:

```javascript
module.exports = {
  '/admin': {
    GET: [ 'assertUser', 'admin.index.configureMenu', 'admin.index.main' ],
    '/routes': {
      POST: [ 'assertUser', 'admin.index.configureMenu', { id: 'assertUser', canAccess: 'admin' }, 'admin.routes.index' ],
    }
  }
};
```

_Note: The middleware specified within the route mappings always get executed after the 
[common middleware](#common-middleware)._

As with other parts of Waigo you can extend and override the built-in route mappings within your app by providing the appropriate file in `<project folder>/src/routes`. You can also include route mappings in your Waigo plugins - [waigo-plugin-admin](https://github.com/waigo/admin) provides an example of this.




