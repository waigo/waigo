# Request middleware

The [staticResources middleware](https://github.com/waigo/waigo/blob/master/src/support/middleware/staticResources.js) is responsible for serving up static resources according to the incoming request. Internally this middleware wraps around [koa-static](https://github.com/koajs/static) to actually perform its function.

By default enabled it is set to serve up static resources from the default static resources folder:

```javascript
// file: <waigo framework>/src/config/base.js

config.middleware.ALL = {
  ...
  staticResources: {
    // relative to <project folder>/src
    folder: config.staticResources.folder,
    // options to pass onto koa-static
    options: {}
},
```

*Note: If you wish to configure how koa-static gets used, you can do so through the `options` key shown above in the configuration settings.*

Waigo checks for the existence of a file named according to the incoming request URL - if a file with the given relative path the exists within the static resources folder then it serves it up and no further requests processing takes place.

For example, let's say you have a file at `<waigo framework>/public/js/app.js`. Any request to the URL `/js/app.js` will be responded to with the `app.js` file. 
