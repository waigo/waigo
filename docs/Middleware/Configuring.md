# Configuring middleware

When initializing middleware it's possible to pass in configuration options to the _initializer_ method. For example, middleware to parse incoming request bodies (in the case of `POST` and `PUT` requests) may look like the following:

```javascript
// file: <project folder>/src/support/middleware/bodyParser.js

const parser = require('co-body');

module.exports = function(App, options) {
  return function*(next) {
    this.request.body = yield parser(this, options);

    yield next;
  };
};
```

In order to construct and use this middleware we would need to pass in options to be sent to the `co-body` module, as such:

```javascript
// let's go for a 16MB request body size limit
const middlewareFn = waigo.load('support/middleware/bodyParser')(App, {
  limit: '16mb'
});	
```

This ability to configure the middleware during initialization is most useful when we are defining the middleware chain for a given [route](../Routing/). For example, let's say we have two routes for updating user information - one to update the user's profile text data and another to update their profile picture. We wish to allow a larger request body size for the profile picture than we do for the other data, so may define them as follows:

```javascript
// file: <project folder>/src/routes/user.js

module.exports = {
  '/user': {
  	'/info': {
      POST: [ { id: 'bodyParser', limit: '1mb' }, 'users.updateInfo' ]
	  },
  	'/pic': {
      POST: [ { id: 'bodyParser', limit: '3mb' }, 'users.updatePic' ]
	  }
  }
};
```

