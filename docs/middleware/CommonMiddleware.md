# Common middleware

As well as per-route middleware you can also define more _common_ middleware, which apply per-HTTP-method and/or to all incoming requests.

Both of these are defined in your app's [configuration](../AppConfiguration/), as such:

```javascript
// file: <project folder>/src/config/base.js

module.exports = function(config) {
  ...
  /* middleware for every request */
  config.middleware.ALL = {
    /* order in which middleware gets run */
    _order: [
      'errorHandler',
      'staticResources',
    ],
    /* options for each middleware's initializer */
    errorHandler: {},
    staticResources: {
      // relative to app folder
      folder: '/static',
    },
  };
  ...
  
  /* middleware for only POST and PUT requests */
  config.middleware.POST = config.middleware.PUT = {
  	/* order in which middleware gets run */
    _order: [
      'bodyParser',
      'csrf',
    ],
    /* options to pass to each middleware's initialier */
    bodyParser: {
      limit: '16mb',
    },
  };
}
```

Once a request has been passed through the common middleware handler chain it then gets handed off to the middleware specific to the route associated with the request.

Let's say you have route defined as such:

```javascript
// file: <project folder>/src/routes/user.js

module.exports = {
  '/user': {
  	'/info': {
      GET: 'users.updateInfo'
	  },
  	'/pic': {
      POST: [ { id: 'bodyParser', limit: '3mb' }, 'users.updatePic' ]
	  }
  }
};
```

Combined with the common middleware defined above, this is what the actual route middleware chain would look like if we were to define it entirely within the route configuration:

```javascript
module.exports = {
  '/user': {
  	'/info': {
     GET: [ 
       'errorHandler',
       { id: 'staticResources', folder: '/static' },
       'users.getInfo' 
     ]
	},
  	'/pic': {
     POST: [ 
       'errorHandler',
       { id: 'staticResources', folder: '/static' },
       { id: 'bodyParser', limit: '16mb' }, 
       'csrf',
       'users.updatePic' 
     ]
	}
  }
};
```



