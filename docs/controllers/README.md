# Controllers

Controllers in Waigo repesent the `C` in the `MVC (Model-View-Controller)` paradigm. Controllers expose middleware generator functions which are expected to be the final handlers in middleware chains, i.e. they are usually responsible for generating the response that will ultimately get sent back for a given client request.

The default Waigo controller (`src/controllers/index`) simply has:

```javascript
// file: <waigo framework>/src/controllers/index.js

exports.main = function*(next) {
  yield this.render('index');
};
```

_Note: `this.render()` is provided by the [output formats](../OutputFormats/) middleware._

The above controller `main` method simply render the `index` template to the client response. If you want the controller function can also behave like normal middleware and pass control to `next`:

```javascript
// file: <waigo framework>/src/controllers/index.js

exports.main = function*(next) {
  yield next;
};
```

## App object

Just like middleware, controllers methods have access to your application's [`App` object]() via `this.App`:

```javascript
// file: <waigo framework>/src/controllers/index.js

exports.main = function*(next) {
  this.body = `Running in mode: ${this.App.config.mode}`;
};
```



## Controllers in routes

Within your route configuration you would normally supply the controller method as the last item in the middleware chain:

```javascript
// file: <project folder>/src/routes/user.js

module.exports = {
  '/user': {
  	'/info': {
      POST: 'users.info',
	},
  	'/pic': {
      POST: [ { id: 'bodyParser', limit: '3mb' }, 'users.updatePic' ]
	}
  }
};
```

For the above configuration Waigo will expect the following to exist:

* `src/controllers/users.js` exposing generator method `info()`
* `src/controllers/users.js` exposing generator method `updatePic()`

You can nest controllers within subfolders in order to keep your codebase clean. If you do this you will need to specific the full subfolder path in your route configuration, replacing the normal path separator with period (`.`). 

For example, let's say your controller is located at `src/controllers/admin/dashboard.js` and exposed the `show()` method. Your route configuration may look like:

```javascript
// file: <project folder>/src/routes/user.js

module.exports = {
  '/admin': {
    GET: 'admin.dashboard.show',
  }
};
```
`