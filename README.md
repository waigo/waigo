# What is Waigo?

[![Build Status](https://secure.travis-ci.org/waigo/waigo.png)](http://travis-ci.org/waigo/waigo) [![NPM module](https://badge.fury.io/js/waigo.png)](https://npmjs.org/package/waigo) [![Code quality](https://codeclimate.com/github/waigo/waigo.png)](https://codeclimate.com/github/waigo/waigo)

Waigo is a flexible MVC framework for building scalable and maintainable web applications.

Based on [koa](http://koajs.com), it uses a clean mechanism for asynchronous programming, removing the 
need for callbacks. Almost every aspect of the core framework can be easily extended or overridden.

_Waigo (and koa underneath it) makes extensive use of [ES6 Generators](http://tobyho.com/2013/06/16/what-are-generators/). It is important that you understand how they work if you wish to understand the source code._

# Getting started

## Installation

Waigo requires **Node.js v0.11.10 or above**. This along with the command-line `--harmony` flag will give us the ES6 features we need. An easy 
way to manage multiples versions of Node.js is to use [NVM](https://github.com/creationix/nvm).

Once Node is installed go ahead and install Waigo:

```bash
$ npm install waigo
```

## Hello world

We will use the [bluebird](https://github.com/petkaantonov/bluebird) library to iterate through our generators:

```bash
$ npm install bluebird
```

Create a new Javascript file (e.g. `app.js`) in your project folder with the following contents:

```javascript
var Promise = require('bluebird'),
  waigo = require('waigo');

// Generator co-routine
Promise.spawn(function*() {
  // Initialise waigo module loading system
  yield* waigo.init();
  // Start the server
  yield* waigo.load('server').start();
})
  .then(function(err) {
    console.log(err);  
  });
```

Let's disable database connections and sesssions for now:

```bash
$ mkdir -p src/config
$ echo "exports.session = null; exports.db = null;" > src/config/development.js
```

Finally, we need a template:

```bash
$ mkdir -p src/views
$ echo "p= title" > src/views/index.jade
```

Start the app:

```bash
$ node --harmony app.js
```

Visit [http://localhost:3000](http://localhost:3000) and you should see the following HTML output: 

```html
<p>Hello world!</p>
```

Waigo is designed to make it easy to re-use your URL routes as JSON APIs. Visit [http://localhost:3000/?format=json](http://localhost:3000/?format=json) and you should see:

```json
{
  title: "Hello world!"
}
```

This is all the data get which gets passed by the default controller to the `index.jade` template we created above. By default Waigo supports 
HTML and JSON output, and more [output formats](#views) can be easily added.

# Extend and Override

In the "Hello World" example above you will have noticed:

```javascript
waigo.load('server')
```

When you want to use something provided by the framework you first have to load its module file through `waigo.load()`. This allows you to:

1. Only load the parts of the framework you will actually use _(performance)_.
2. **Override any framework module file with your own version** _(extendability and customization)_.

When you want to load the `server` module file (as above) the loader will look for it in the following locations:

1. `<your app folder>/src/server.js`
2. `<waigo npm module folder>/src/server.js`

_Note: if you have [plugins](#plugins) installed their paths will also be searched._

So if you provide a `server.js` within your app's folder tree then Waigo will use that instead of the default one provided by the framework. This rules applies to **every** module file within the framework. 

Thus if you don't like something provided by Waigo you can easily override it. But what if you specifically wanted the version of `server.js` provided by the framework? Just prefix `waigo:` to the module file name:

```javascript
// this will load the version of server.js provided by Waigo, and not the one provided by your app
waigo.load('waigo:server');   
```

This also means you don't have to completely override the framework version. You can also _extend_ it:

```javascript
// in file: <your app folder>/src/server.js

var waigo = require('waigo');

// load in Waigo framework version of server.js
module.exports = waigo.load('waigo:server');    

// override start()
exports.start = function*() {...}   
```

Going back to the small "Hello world" example we built above, there is another call we make:

```javascript
yield* waigo.init();
```

Waigo works out which module files are available in the call to `waigo.init()`. It does this so that:

1. Subsequent calls to `waigo.load()` are fast _(since we already know what's available and where everything is)_.
2. It can catch any [plugin conflicts](#plugins) at startup _(rather than later on, when your app is already running)_.

_Note: This method takes an optional configuration parameter which tells it where to find the app's `src` folder and the names of plugins to load, etc. See [API docs](http://waigojs.com/api) for more info._

## Plugins

You may wish to re-use functionality between different Waigo-based apps. In which case you can place such code into an NPM module - this is essentially what a _plugin_ is. 

To load a plugin at startup simply `npm install` it and then add it to one of either `dependencies`, `devDependencies` or `peerDependencies` within your `package.json` file. When `waigo.init()` is called Waigo will automatically scan `package.json` to get all plugins (by default it considers anything prefixed with `waigo-` as a plugin). It will then scan each plugin's `src` folder 
tree for available module files and register them internally.

Let's say you have a plugin - `waigo-mongo` - which enables the use of MongoDB database connections. And let's say it provides the following module file: `support/db/mongo.js`.

One `waigo.init()` has been called, if you then call `waigo.load('support/db/mongo')` the system will load the module file from the plugin module's `src` folder. If you were to now create `support/db/mongo.js` within your app's `src` folder then the app version would take precendence over the plugin version. 

Strictly speaking, location precendence is as follows: **App > Plugins > Waigo framework**.

What would happen if you had two plugins which both provided the same module file? in this case the call to `waigo.init()` would fail with 
an error which looks like the following:

```bash
Error: Module "support/db/mongo" has more than one plugin implementation to choose from: waigo-plugin1, waigo-plugin2, ...
```

If you don't want to remove one of the offending plugins then pick which plugin's implementation you want to use by providing a version of the module file within your app's folder tree. For example, if you wanted Waigo to use the implementation provided by `waigo-plugin1` then you would do:

```javascript
// in file: <your app folder>/src/support/db/mongo.js

var waigo = require('waigo');

// use the implementation from waigo-plugin1
module.exports = waigo.load('waigo-plugin1:support/db/mongo');    
```

_Note: See the `waigo-plugin1` prefix used in the call to `waigo.load()`? that basically tells the loader which module to load from._

To create and publish your own plugin to the wider community please follow these guidelines:

* Ensure your plugin name is prefixed with `waigo-` so that it's easy to find.
* Write a good README.md for your plugin explaining what it's for and how to use it.
* Add tests for your plugin and hook them upto [Travis CI](https://travis-ci.org/).
* In your `package.json` tag your plugin with the `waigoplugin` keyword.

To see a list of all available plugins visit [https://www.npmjs.org/browse/keyword/waigoplugin](https://www.npmjs.org/browse/keyword/waigoplugin).

# Configuration

Configuration info is loaded into the Koa app object and is always accessible at `app.config`.

The `src/config` folder holds configuration files loaded by Waigo during app startup. The `base` module file gets loaded first. Additional configuration modules then get loaded in the following order:
 
1. `config/<node environment>`
2. `config/<node environment>.<current user>`

Thus if node is running in `test` mode (i.e. `NODE_ENVIRONMENT=test`) and the user id of the process is `www-data` then the loader 
looks for the following module files and loads them if present, in the following order:
 
1. `config/test`
2. `config/test.www-data`

The base configuration object gets _extended_ with each subsequently loaded config module file. This means that in each subsequent file you only need to override the configuration properties that differ.

The current mode is stored in `app.config.mode` and the user id in `app.config.user`.


# Routing

Routes are specified as a mapping in the `routes` module file in the following format:

```javascript
// in routes.js

module.exports = {
  'GET /' : 'main.index',
  'PUT /newUser/:id': ['sanitizeValue', 'checkRequestBodySize', 'main.newUser'],
  ...
};
```

The key specifies the HTTP method (one of: `GET`, `POST`, `PUT`, `DEL`, `OPTIONS` and `HEAD`) and the route URL (relative to `app.config.baseURL`). Parameterized routing is supported thanks to [trie-router](https://github.com/koajs/trie-router).

The value for each key specifies the middleware chain that will handle that route. If the middleware name has a period (`.`) within it it assumed to refer to a `controller.method`. Otherwise it is assumed to be the name of a [middleware](#middleware) module file.

For the above example, Waigo will process the a `PUT` request made to `/newUser` in the following order:

1. Load `support/middleware/sanitizeValue` and pass request to its exported method
2. Load `support/middleware/checkRequestBodySize` and pass request to its exported method
3. Load `controllers/main` and pass request to its `newUser` method

## Middleware

Waigo middleware works the same as Koa middleware. All middleware module files can be found under the `support/middleware` path. Additional middleware provided by your app and/or plugins should also sit under this path.

A middleware module file is expected to `export` a function which, when called, returns a generator function to add to the Koa middleware layer. For example:

```javascript
// in file: support/middleware/example.js

module.exports = function() {
  return function*(next) {
    // do nothing and pass through
    yield next;
  };
};
```

By default the following middleware is applied to all incoming requests:

* `errorHandler` - catch and handle all errors thrown during request processing
* `outputFormats` - setup the response [output format](#views)
* `responseTime` - set the X-Response-Time header
* `sessions` - create and retrieve the active client session
* `staticResources` - handle requests made to static page resources, e.g. stylesheets, etc.


# Controllers

Controllers provide middleware as generator functions. The default controller (`controllers/main`) simply has:

```javascript
exports.index = function*(next) {
  yield this.render('index', {
    title: 'Hello world!'
  });
};
```

A controller must either call `this.render()` or pass control to the `next` middleware in the request chain.

# Models

At present Waigo does not provide a model layer in order to be as flexible as possible. Feel free to use an ORM, ODM, flat files or whatever type of model layer you want.

The default configuration (`app.config.db`) does however create a Mongo database connection using [mongoose](http://mongoosejs.com/). This connection (once established) is available through `app.db`. All supported database connection types are stored in the path `support/db`.

## Sessions

Sessions are available inside middleware using `this.session`:

```javascript
// inside a controller

exports.index = function*(next) {
  yield this.render('index', {
    name: this.session.userName
  });
};
```

Sessions are created and loaded by the `support/middleware/sessions` middleware, which internally uses [koa-session-store](https://github.com/hiddentao/koa-session-store).

By default sessions are stored in a Mongo database (you can re-use the Mongoose database connection) and cookies are issued to clients to keep track of sessions. The session configuration (`app.config.session`) expects you to provide cookie signing keys for use by [Keygrip](https://github.com/jed/keygrip):

```javascript
exports.session = {
  // cookie signing keys - these are used for signing cookies (using Keygrip) and should be set for your app
  // keys: ['use', 'your', 'own'],
  // session cookie name
  name: 'waigo',
  // session storage
  store: {
    // session store type
    type: 'mongo',
    // session store config
    config: {
      url: 'mongodb://127.0.0.1:27017/waigo',
      collection: 'sessions'
    }
  },
  // more cookie options
  cookie: {
    // cookie expires in...
    validForDays: 7,
    // cookie valid for url path...
    path: '/'
  }
};
```


# Views

Views work the same as in other frameworks, with Jade as the default template language. But the view layer also supports the idea of different output formats.

Having different output formats makes it easy to re-use your route handlers (i.e. controllers) for dfferent types of front-ends. For example, you may wish to build a single-page web app or a mobile app which interacts with your back-end in a similar fashion to your normal web interface. Being able to re-use your controllers to output JSON makes life a easier in such cases.

The relevant configuration section (`app.config.outputFormats`) looks like:

```javascript
exports.outputFormats = {
  // List of enabled formats along with options to pass to each formatter.
  formats: {
    html: {
      // Folder relative to application root folder, in which to look for view templates.
      folder: 'views',
      // Default view template filename extension when not explicitly provided.
      ext: 'jade'
      // Map file extension to rendering engine
      engine: {
        'jade': 'jade'
      }
    },
    json: {}
  },
  // Use this URL query parameter to determine output format.
  paramName: 'format',
  // Default format, in case URL query parameter which determines output format isn't provided.
  default: 'html'
};
```

As you can see, HTML and JSON output formats are supported by default, with the specific format chosen via a configurable URL query parameter. The actual implementations of each output format can be found in `support/outputFormats/*`. 

To add your own custom output format:

1. Create a module file under `support/outputFormats/` with your format's name. 
2. Add your format's name into the `app.config.outputFormats` configuration object along with any necessary configuration info.

The associated middleware which sets up the output format for a request is located in `support/middleware/outputFormats`. It adds a `render()` method to the middleware context object. You use this as as follows:

```javascript
// in file: controllers/mycontroller.js

exports.userProfile = function*(next) {
  yield this.render('profile', {
    id: this.params.userId
  });
};
```

If we were to call the URL mapped to this controller method and append the `format=json` query parameter then the output would be of JSON type. The default JSON output formatter simply outputs the attribute data passed to the template, i.e. the output for above (assuming `this.params.userId` is 123) would be:

```javascript
{ id: 123 }
```

# Logging

Waigo provides support for [winston](https://github.com/flatiron/winston) by default. The default Winston logging target (see `config/base`) is a Mongo database. For `development` mode it's set to the console. All uncaught exceptions and `error` events emitted on the koa app object get logged in this way.

You may use any logging library you wish. The `app.config.logging` configuration object both specifies the name of a logger (to be loaded from the `support/logging` path) and configuration to pass to that logger.

## Error handling

The `support/middleware/errorHandler` middleware is responsible for handling all errors which get thrown during the request handling process. Errors get logged through the default logger as well as getting sent back to the client which made the original request. 

There are also a few built-in error classes inheriting from the base `Error` object. These can be found in `support/errors`. If you wish to create your own type of errors it is highly recommended that you sub-class `BaseError`. For example:

```javascript
var waigo = require('waigo'),
  errors = waigo.load('support/errors');

var FileSystemError = errors.BaseError.createSubType('MyNewError', {
  // default error message
  message: 'Error accessing file system', 
  // HTTP status code to set when this error is thrown
  status: 500
});

...

throw new FileSystemError('Error reading image file');
```

_Note: Stack traces only get logged if the `app.config.errorHandler.showStack` flag is turned on_


## Debugging

Sometimes in order to fix a problem it's useful to know what's going on inside the framework.

Waigo makes use of the [debug](https://github.com/visionmedia/debug) utility internally in some parts. For instance, to debug the 
[loading system](#extend-and-override) run your app with the `DEBUG` environment variable as follows:

```bash
$ DEBUG=waigo-loader node --harmony app.js
  waigo-loader Getting plugin names... +0ms
  waigo-loader Plugins to load:  +15ms
  waigo-loader Module "routes" will be loaded from source "waigo" +10ms
  waigo-loader Module "server" will be loaded from source "waigo" +0ms
  waigo-loader Module "config/base" will be loaded from source "waigo" +0ms
  ...
  waigo-loader Loading module "server" from source "waigo" +0ms
  ...
``` 

# Contributing

Suggestions, bug reports and pull requests are welcome. Please see [CONTRIBUTING.md](https://github.com/waigo/waigo/blob/master/CONTRIBUTING.md) for guidelines.

# License

MIT - see [LICENSE.md](https://github.com/waigo/waigo/blob/master/LICENSE.md)

