# What is Waigo?

\[ [Guide](http://waigojs.com/guide.html) • [API](http://waigojs.com/api/) • [Examples](http://waigojs.com/examples/) • [Sites](http://waigojs.com/sites.html) \]

[![Build Status](https://secure.travis-ci.org/waigo/waigo.png)](http://travis-ci.org/waigo/waigo) [![NPM module](https://badge.fury.io/js/waigo.png)](https://npmjs.org/package/waigo) [![Code quality](https://codeclimate.com/github/waigo/waigo.png)](https://codeclimate.com/github/waigo/waigo)

Waigo is a Node.js framework for building scalable and maintainable web 
application back-ends.

Quick overview:

 * Based on [koa](http://koajs.com/), uses ES6 generators, no callbacks
 * Database, model-layer and front-end agnostic - use whatever you want
 * Easily build REST/JSON APIs using [output formats](#views-and-output-formats)
 * Flexible routing with [per-route middleware](#routing) customisation
 * Easily build [forms](#forms) with sanitization and validation
 * [Extend](#extend-and-override) or override _any_ part of the core framework
 * Bundle up functionality into re-usable [plugins](#plugins)
 * And much, much more...
 
_**Note:** this guide (along with API docs) is also available at [waigojs.com](http://waigojs.com)_


# Why should I use Waigo?

Waigo provides you with a sensible file layout for your app and a clean app 
architecture (mostly MVC). It doesn't try to do too much and most importantly 
it gets out of your way when you need it to.

Most frameworks are opinionated and so is Waigo - it is designed to accommodate 
most people's needs. But it tries to keep its opinions to a minumum, even 
letting you [override](#extend-and-override) any aspect of its core that you 
don't find satisfactory.

Think of Waigo as the foundation on which to build your web app. For example 
the basic framework does not provide a database connection or any front-end 
templates. Instead it provides you with the hooks and entry points to use 
whatever database, model layer and/or front-end you want.

Does this mean you have to build everything from scratch each time you use 
Waigo? Not at all. You can make anything you build re-useable by bundling it up 
as a [plugin](#plugins). Check out the [current list of plugins](https://www.npmjs.org/browse/keyword/waigo) 
to see what's already available.

# Getting started

## Installation

Waigo requires **Node.js v0.11.10 or above**. This along with the command-line 
`--harmony` flag will give us the ES6 features we need. An easy 
way to manage multiples versions of Node.js is to use [NVM](https://github.com/creationix/nvm).

Waigo comes with a [command-line interface](#command-line) (CLI). It's best to install 
Waigo as a global NPM module so that you can easily use this tool.

```bash
$ npm install -g waigo
```

## Hello world

If your project folder is located at e.g. `/dev/myapp` then Waigo will by 
default assume that the source code for your app will be located in a 
`src` subfolder, i.e. at `/dev/myapp/src`. This folder will from now on be 
referred to as your 'app folder'.

Inside your project folder run the following command:

```bash
$ waigo init

[waigo-cli] NPM install waigo
[waigo-cli] NPM install co
... 
[waigo-cli] Creating: start-app.js
[waigo-cli] Creating: src/views/index.jade
```

You can now start your application by running:

```bash
$ ./start-app.js

2014-06-02T05:13:25.993Z - info: Server listening in development mode on port 3000 (baseURL: http://localhost:3000)
```

Visit [http://localhost:3000](http://localhost:3000) and you should see some 
HTML which says 'Hello Waigo!'.


# Extend and Override

Waigo has a very modular architecture. In the "Hello World" example above you 
will have noticed the call:

```javascript
waigo.load('application')
```

When you want to use something provided by the framework you first have to load 
its module file through `waigo.load()`. This allows you to:

1. Only load the parts of the framework you will actually use _(good for 
performance)_.
2. **Override any framework module file with your own version** _(extendability 
and customisation)_.

When you want to load the `application` module file (as above) the loader will 
look for it in the following locations:

1. `<app folder>/src/application.js`
2. `<waigo npm module folder>/src/application.js`

_Note: if you have [plugins](#plugins) installed their paths will also be 
searched._

So if you provide a `application.js` within your app's folder tree then Waigo 
will use that instead of the default one provided by the framework.

**If you do not like something provided by Waigo you can easily override it.**

But what if you specifically wanted the version of `application.js` provided by 
the framework? Just prefix `waigo:` to the module file name:

```javascript
// this will load the version of app.js provided by Waigo, 
// and not the one provided by your app
waigo.load('waigo:application');   
```

This also means you don't have to completely override the framework version. 
You can also _extend_ it:

```javascript
// in file: <app folder>/src/application.js

var waigo = require('waigo');

// load in Waigo framework version of app.js
var App = module.exports = waigo.load('waigo:application');    

// override start()
App.start = ...
```

## Module loader

We said earlier that you can override every module file within the framework 
with your own custom version that sits within your application folder tree. 

The available module files and their overrides are all worked out in the call 
to [`waigo.init()`](http://waigojs.com/api/loader.js.html#init). This 
always has to be the first call you make when initialising your application. 

The `.init()` method scans for module files in the following locations:

* The Waigo framework folder tree
* Folder trees belonging to Waigo [plugins](#plugins)
* Your application's folder tree

Note that it does not scan the following sub paths within each folder tree:

* `src/views` - this usually contains Jade templates
* `cli/data` - this contains data for use by the [command-line](#command-line) tools

Thus anything you place within the above sub-paths can neither be loaded 
through `waigo.load()` nor overridden. 

## Plugins

As mentioned earlier, You can make anything you build re-useable by bundling it 
up as a plugin.

By separating non-core functionality into plugins (which can then be thoroughly 
documented and tested) we encourage code re-use across projects. Plugins help 
us to keep the core framework more focussed, flexible and increase the overall 
quality of code in the Waigo ecosystem.

Since plugins are just NPM modules they are very easy to share with others,
and come with all the benefits that are available to normal NPM modules.

### Loading plugins

The `waigo.init()` method automatically tries to work out what plugins are 
available by loading in the `package.json` file. By default it searches the 
`dependencies`, `devDependencies` and `peerDependencies` lists for any modules 
which are prefixed with `waigo-` and assumes that these are plugins which 
should be loaded.

However you can override every aspect of this search. The documentation for 
`waigo.init()` gives you the available options:

```javascript
/**
 * ...
 * @param {Object} [options.plugins] Plugin loading configuration.
 * @param {Array} [options.plugins.names] Plugins to load. If omitted then other options are used to load plugins.
 * @param {Array} [options.plugins.glob] Regexes specifying plugin naming conventions. Default is `waigo-*`.
 * @param {String|Object} [options.plugins.config] JSON config containing names of plugins to load. If a string is given then it assumed to be the path of a Javasript file. Default is to load `package.json`.
 * @param {Array} [options.plugins.configKey] Names of keys in JSON config whose values contain names of plugins. Default is `dependencies, devDependencies, peerDependencies`.
 ...
*/
```

As you can see you can list the desired plugins in a config file of your 
choosing and then supply the path to this file. Or you can directly supply a 
config `Object` itself. And you can override the plugin naming conventions, i.e. 
how Waigo decided whether something is a plugin name or not. 


### Example

The [waigo-mongo](https://www.npmjs.org/package/waigo-mongo) plugin enables 
database connectivity and session storage using MongoDB. It provides the 
following modules files:

* `src/support/db/mongo`
* `src/support/session/store/mongo`

To get the plugin use `npm`:

```bash
# --save ensures it gets added as depenendcy in package.json (so that Waigo will find it)
npm install --save waigo-mongo 
```

To enable the database connectivity, your base configuration may look like:

```javascript
// in file: <app folder>/src/config/base.js

var waigo = require('waigo');

module.exports = function(config) {
  // re-use base config from framework
  waigo.load('waigo:config/base')(config);

  config.db = {
    host: '127.0.0.1',
    port: 27017
    db: 'myapp'
  };
};
```

You can of course also load in the plugin's module files within any of your own 
code as such:

```javascript
// in file: <app folder>/src/myrandomfile.js

// notice how we prefix with the plugin name so that Waigo knows we want this 
// specific version
var mongoDb = waigo.load('waigo-mongo:support/db/mongo');
```

And you can of course override any module file the plugin provides with your 
own:

```javascript
// in file: <app folder>/src/support/db/mongo.js

exports.create = function*(dbConfig) {
  ...
};
```

Calls made to `waigo.load('support/db/mongo')` will now load your app version 
rather then the plugin version.

Strictly speaking, location precendence is as follows: **App > Plugins > Waigo
framework**.

What would happen if you had two plugins which both provided the same module
file? in this case the call to `waigo.init()` would fail with an error:

```bash
Error: Module "support/db/mongo" has more than one plugin implementation to choose from: waigo-plugin1, waigo-plugin2, ...
```

If you need to use both plugins (maybe because they provide other
functionality) then pick which plugin's implementation you want to use by
providing a version of the module file within your app's source folder tree. For
example, if you wanted Waigo to use the implementation provided by `waigo-
plugin1` then you would do:

```javascript
// in file: <app folder>/src/support/db/mongo.js

var waigo = require('waigo');

// use the implementation from waigo-plugin1
module.exports = waigo.load('waigo-plugin1:support/db/mongo');    
```

### Publishing

To create and publish your own plugin to the wider community please follow 
these guidelines:

* Check to see if what you've made is worth putting into a plugin. For instance 
it's very easy to re-use [koa](http://koajs.com) middleware in Waigo without 
needing to create plugins.
* Ensure your plugin name is prefixed with `waigo-` so that users and Waigo 
itself can easily find it and use it.
* In your plugin's `package.json` set the `main` key is set to `index.js`. Create a dummy 
`index.js` file in your plugin's root folder. This is needed to be able to load and 
use your plugin. 
* Write a good README.md for your plugin explaining what it's for and how to use it.
* Add automated unit tests for your plugin. Look at existing plugins to learn 
best practices.
* In your `package.json` tag your plugin with the `waigo` keyword so that 
users can easily search for it.

To see a list of all available plugins visit 
[https://www.npmjs.org/browse/keyword/waigo](https://www.npmjs.org/browse/keyword/waigoplugin).




# Command-line

Waigo comes with a Command-line interface (CLI) which makes it easy to get a 
working application up and running. 

We recommend installing Waigo as a global NPM module so that the CLI is 
available in your `PATH`. It's smart enough to delegate control to your local 
installation of Waigo (in your `node_modules` folder) if one is present.

The available CLI commands can be seen by typing:

```bash
$ waigo --help

  Usage: waigo [options] [command]

  Commands:

    init [options]         Initialise and create a skeleton Waigo app
    ...

  Options:

    -h, --help     output usage information
    -V, --version  output the version number

``` 

Further help is available for each command. For example to find out what 
arguments are possible for the `init` command (which we used in the 
[Hello World](#hello-world) example earlier):

```bash
$ waigo init --help

  Usage: init [options]

  Options:

    -h, --help             output usage information
    ...
```

In the Waigo framework folder tree you will notice the `cli/data` path. This 
folder contains 
any data to be used the CLI commands (e.g. script templates) and does not get 
scanned by the Waigo [module loader](#module-loader).

## Custom commands

Each CLI command is implemented as a module file under the `cli/` path. The 
CLI executable scans this path at startup and loads in all available commands. 

You can easily override and/or extend 
built-in commands as well as add your own, and even bundle up custom commands 
as plugins to be shared with others.

All CLI commands are implemented as concrete subclasses of 
[`AbstractCommand`](http://waigojs.com/api/support/cliCommand.js.html). This 
base class provides a number of useful utility methods for use by actual 
commands.


# Startup

When the application starts up - i.e. when`waigo.load('application').start()` 
is called - Waigo runs the configured startup steps.

```javascript
// file: <waigo framework>/src/application.js

App.start = function*(...) {
  ...

  for (let idx in app.config.startupSteps) {
    let stepName = app.config.startupSteps[idx];
    ...
    yield* waigo.load('support/startup/' + stepName)(app);
  }
};
```

Startup modules are responsible for initialising the
various aspects of your application. For example, here is the `middleware`
startup step:


```javascript
// file: <waigo framework>/src/support/startup/middleware.js

module.exports = function*(app) {
  for (let idx in app.config.middleware) {
    let m = app.config.middleware[idx];
    ...
    app.use(waigo.load('support/middleware/' + m.id)(m.options));
  }
};
```

This particular startup step sets up the middleware that will apply to *all*
incoming requests. You can customise the middleware for a particular route in 
the [routing configuration](#routing)_.

The default startup steps can all be found under the `support/startup` file path
and can all be overridden within your app. And of course, you can add your own
startup steps.

For example, lets add a step which simply outputs the current date and time:

```javascript
// file:  <app folder>/src/support/startup/timeAndDate.js

mdoule.exports = function*(app) {
  console.log(new Date().toString());
};
```

We then tell Waigo to load and execute this startup step in `development` mode 
by modifying the appropriate configuration file:

```javascript
// file:  <app folder>/src/config/development.js

module.exports = function(config) {
  config.startupSteps = [
    'logging',
    'database',
    'middleware',
    'routes',
    'listener',
    'timeAndDate'
  ];
};
```


# Configuration

Configuration for your application is loaded during [startup](#startup) and is 
always accessible at `this.app.config` within your controllers.

The `config` folder path within your application holds the configuration files.
Each configuration file exports a function which accepts the current
configuration object as a parameter. This object can then be modified:

```javascript
module.exports = function(config) {
  // modify config in here
};
```

Each successively loaded configuration file gets passed the same configuration
object. As we'll see in the next section this makes it easy to customise the
application configuration depending on the mode in which we're running it -
production, testing, etc.

## File load order

The `config/index` module file is the configuration loader. It looks for and 
loads configuration module files in the following order:

1. `config/base`
2. `config/<node environment>`
3. `config/<node environment>.<current user>`

The `config/base` module file sets the configuration common to all modes in 
which the application may run.

The configuration module files following this one are optional. Which ones get
loaded depends on the value of the `NODE_ENV` environment variable. If this is
not set then we assume that the application is being run in development mode
(i.e. we assume its value to be `development`).

_Note: When running your application in a production environment ensure you
set the `NODE_ENV` environment variable to `production` or something similar._

The final configuration file which gets loaded is associated with the mode in 
which the application is running as well as the id of the user who is 
executing the current application. This conveniently allows different users to 
further customise the configuration according to their own needs.

Let's look at a concrete example...

Let's say `NODE_ENV` is set to `test` mode and that the user id of the process 
is `www-data`. The configuration loader will initialise an object 
configuration object and then pass it to each of the following files in the 
given order:
 
1. `config/base`
1. `config/test`
2. `config/test.www-data`

Let's say we want to provide `config/base` in our app but that we want to re-use
some of the configuration provided by the framework's version of this file.
We can easily do this as follows:

```javascript
// file: <app folder>/src/config/base.js

module.exports = function(config) {
  // re-use config/base from framework
  waigo.load('waigo:config/base')(config);

  // now we override the necessary bits for our app...
  config.baseURL = 'http://example.com';
  config.port = 9000;  
};
```

_Note: The application mode is always accessible at `app.config.mode`
and the id of the user owning the process at `app.config.user`._

## Runtime modification

Sometimes we may want to modify the configuration when it gets loaded at
runtime, beyond what's in our configuration files. For example, we may wish to 
modify the configuration according to command-line parameters which have 
been passed in.

The `Application.start()` accepts an options object. One of the options is a 
`postConfig` function which behaves the same as a configuration file. It will 
get passed the configuration object once all configuation files have already 
been loaded and executed:

```javascript
let App = yield* waigo.load('application');

App.start({
  // This function gets passed the final config object returned by the 
  // configuration loader
  postConfig: function(config) {
    config.baseURL = ...;
    // ...etc
  }
});
```

# Routing

Waigo's router provides a user-friendly mapping syntax as well as per-route
middleware customisation.

Routes are specified as a mapping in the `routes` module file in the following
format:

```javascript
// file: <app folder>/src/routes.js

module.exports = {
  'GET /' : 'main.index',
  'PUT /newUser/:id': ['sanitizeValue', 'checkRequestBodySize', 'main.newUser'],
  ...
};
```

The key specifies the HTTP method. This must be one of: `GET`, `POST`, `PUT`,
`DEL`, `OPTIONS` and `HEAD`. The second part of the key is the route URL
relative to `app.config.baseURL`. 

_Note: Parameterized and regex routing is also supported. See [trie-
router](https://github.com/koajs/trie-router) for more information._

The value mapped to a key specifies the middleware chain that will handle that
route. If the middleware name has a period (`.`) within it then it is assumed to
refer to a controller module file and a method name within. Otherwise it is
assumed to be the name of a [middleware](#middleware) module file.

For the above example, Waigo will process a `PUT` request made to `/newUser` as
follows:

1. Load `support/middleware/sanitizeValue` and pass request to its exported
method. 
2. Load `support/middleware/checkRequestBodySize` and pass request to its
exported method. 
3. Load `controllers/main` and pass request to its `newUser` method.

The middleware chain specified for a route gets executed after the 
[common middleware](#common-middleware).

If you wish to initialise a particular middleware with options then you can
specify it as an object:

```javascript
// in routes.js

module.exports = {
  'POST /signup' : [ { id: 'bodyParser', limit: '1kb' }, 'main.signup' ]
  ...
};
```

In the above configuration the `bodyParser` middleware will get initialized with
the request body size limit of `1KB`. For performance reasons this
initialization process only happens once, when the routes are first parsed and
processed.

# Middleware

Waigo middleware works the same as Koa middleware. All middleware module files
can be found under the `support/middleware` path. Additional middleware provided
by your app and/or plugins should also sit under this path.

A middleware module file is expected to export a 'constructor' function which,
when called will returns a generator function to add to the Koa middleware
layer. For example:

```javascript
// file: <app folder>/src/support/middleware/example.js

module.exports = function(options) {
  return function*(next) {
    // do nothing and pass through
    yield next;
  };
};
```

**Thus, existing koa middleware can easily be used with Waigo with little 
extra work.**

If a given middleware is being initialised during startup (i.e. see below) then
additional options from the `app.config.middleware` configuration object get
passed to the middleware  constructor:

```javascript
// in file: <app folder>/src/config/base.js
module.exports = function(config) {
  ...
  config.middleware = {
    /* Order in which middleware gets run */
    order: [
      'errorHandler',
      'example',
    ],
    /* Options for each middleware */
    options: {
      example: {
        // everything in here gets passed to the 'example' middleware constructor
      }
    }
  };
  ...
}
```

## Common middleware

During the `middleware` startup step, by default the following middleware
modules are initialised so that all incoming requests get processed by them:

* `errorHandler` - catch and handle all errors thrown during request processing
* `staticResources` - handle requests made to [static resources](#static-resources)
* `outputFormats` - setup the response [output format](#views-and-output-formats)
* `sessions` - create and retrieve the active client [session](#sessions)


# Controllers

Controllers in Waigo expose route handling methods which work as they do in koa.
The default controller generated by the `init` [CLI](#command-line) command - `controllers/main` - simply has:

```javascript
// file: <waigo framework>/src/controllers/main.js

exports.index = function*(next) {
  yield this.render('index', {
    title: 'Hello Waigo!'
  });
};
```

A controller must either send some output or pass control to the `next`
middleware in the request chain. The `this.render()` call is provided by the 
[output formats](#views-and-output-formats) middleware.

# Database and Models

By default Waigo does not initialise a database connection during startup and
nor does it dictate what type of storage you should or shouldn't use. There is
also no default model layer since that would probably depend on the type of
database (or lack thereof) used by your app.

This design choice reflects the fact there are already plenty of existing
components - e.g. Mongoose, JugglingDB - that already provide for rich model
layers with various back-ends.

So use whatever you want. Check to see if there are already
[plugins](https://www.npmjs.org/search?q=waigo) for your preferred storage and
model layers. If not maybe you can build one!

Some available plugins:

* [waigo-mongo](https://www.npmjs.org/package/waigo-mongo) - Connect to MongoDB via mongoose.

# Sessions

You can access session data using `this.session`:

```javascript
// file: some controller

exports.index = function*(next) {
  yield this.render('index', {
    name: this.session.userName
  });
};
```

To delete a session simply use `this.session = null`.

Sessions are created and loaded by the `sessions` middleware, which internally
uses [koa-session-store](https://github.com/hiddentao/koa-session-store) to
allow for pluggable session storage layers.

The default session middleware configuration looks as follows:

```javascript
// file: <waigo framework>/src/config/base.js
module.exports = function(config) {
  ...

  config.middleware.options.sessions = {
    // cookie signing keys - these are used for signing cookies (using Keygrip) and should be set for your app
    keys: ['use', 'your', 'own'],
    // session cookie name
    name: 'waigo',
    // session storage
    store: {
      // session store type
      type: 'cookie',
      // session store config
      config: {
        // nothing needed for cookie sessions
      }
    },
    // session cookie options
    cookie: {
      // cookie expires in...
      validForDays: 7,
      // cookie valid for url path...
      path: '/'
    }
  };
```

By default session data is stored in the session cookie itself. There are other
session storage plugins available for use, for example:

* [waigo-mongo](https://www.npmjs.org/package/waigo-mongo) - Store session data in Mongo.


# Views and Output formats

Let's say you have a controller method which looks like this:

```javascript
// file: <waigo framework>/src/controllers/main.js

exports.index = function*(next) {
  yield this.render('index', {
    title: 'Hello Waigo!'
  });
};
```

When this gets executed Waigo will look for and load `<app folder>/views/index.jade`, 
pass it to the [Jade](jade-lang.com) template engine for rendering, and pass 
the result to the client.

However, if the incoming request has the `format` query parameter set to 'json' 
then the requesting client will see the following output:

```
{
  title: 'Hello Waigo!'
}
```

Why is this? 

Waigo introduces the concept of 'output formats' to make it easy to cater 
for different types of clients.

Nowadays most web apps often have single-page web versions and/or mobile apps
which need to use a REST API or the equivalent to communicate with the back-end.
By supporting more than one one output format Waigo enables you to serve all of
these different clients using the same route handler.

The default output formats configuration is as follows:

```javascript
// file: <waigo framework>/src/config/base.js
module.exports = function(config) {
  ...

  config.middleware.options.outputFormats = {
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

HTML and JSON output formats are supported by default, with the
specific format chosen via the `format` URL query parameter. The actual
implementations of each output format can be found in the
`support/outputFormats` module file path.

The `outputFormats` middleware sets up the output format for every request. It 
also adds the `this.render()` method you saw being used earlier in the default 
controller.

**Tip: In order to make effective use of output formats, ensure all the data
needed by your view templates is generated before you render the template.
This will make it easier for you to switch between differnet output formats as
and when needed without having to generate data separately for each different
format.**

## Custom formats

You can easily add your own custom output formats. For example, let's say you
wanted to add an XML output format. You would first create an implementation for
your output format:

```javascript
// file: <app folder>/src/outputFormats/xml.js

var xml_renderer = ...

exports.create = function(options) {
  var render = xml_renderer.init(options);    

  // 'render' should now equal a generator function which wil return the 
  // rendered output

  return {
    render: function*(view, locals) {
      this.body = yield render(view, _.extend({}, locals, this.app.locals));
      this.type = 'application/xml';
    }
  };
};
```

Once this is done and you can enable it by modifying the `outputFormats`
middleware configuration. For example:

```javascript
// file: <app folder>/src/config/base.js
module.exports = {
  ...

  config.middleware.options.outputFormats = {
    ...
    xml: {
      config: {
        // any initialisation for the XML renderer could go here
      }
    }
  };
```

## View objects

_View objects_ are plain Javascript objects which represent back-end data we
wish to send to the client.

Why use them?

When sending data back to the client we may want to first modify it, e.g. format
dates, remove parts of the data that the client does not need to see in the
given context, etc. 

The `this.render()` method provided by the [output formats](#views-and-
output-formats) middleware checks the passed-in template variables to see if
view objects can be generated for them. 

An object can generate a view object representation of itself if it implements
the `HasViewObject` mixin (see the  `support/mixins` module file). Applying this
mixin to a class requires you to implement a `toViewObject()` generator function
for that class. 

The `toViewObject()` function takes a single argument - the context for the
current request, allowing you to tailor the view object representation according
to each individual request.

For example, let's say we have a model instance which holds data wish to send to
the client:

```javascript
var waigo = require('waigo'),
  mixins = waigo.load('support/mixins');

var Model = function(name) {
  this.name = name;
  this.id = 234;
};
mixins.apply(Model, mixins.HasViewObject);

Model.prototype.toViewObject = function*(ctx) {
  // we will alter the view object representation according to a specific 
  // request header which gets passed in
  customKey = ctx.req.header['x-custom-key'];

  if ('test' === customKey) {
    return {
      name: this.name,
      id: this.id
    };
  } else {
    return {
      name: this.name
    }
  }
};
```

In our controller we can easily pass this to the output format renderer:

```javascript
// controllers/main.js

exports.index = function*() {
  this.render('index', {
    person: new Model('John'),
    stats: {
      age: 31,
      score: 10
    }
  });
}
```

The output (if we requested the JSON output format) will look like:

```
{
  person: {
    name: 'John'
  },
  age: {
    age: 31,
    score: 10
  }
}
```

Notice how the renderer didn't output the `id` attribute of our model instance.
Also notice how the `stats` key-value pair was output  just as it is. If a given
template variable does not implement the `HasViewObject` mixin then it gets
output as it is, unchanged.

If we now make the request with the `x-custom-key: test` header set then we will
instead get:

```javascript
{
  person: {
    name: 'John',
    id: 234
  },
  age: {
    age: 31,
    score: 10
  }
}
```

All built-in [error](#errors) classes (including form [validation](#validation)
errors) implement the `HasViewObject` mixin. In fact, when
the error handler sends an error response to the client it uses the view object
representation of the error.

## Template globals

The HTML output format contains the following rendering code:

```javascript
this.body = yield render(view, _.extend({}, this.app.locals, locals));
```

The template variables passed to the `render()` method get converted to view
objects and then passed in as `locals`. Notice however, that `this.app.locals`
also gets passed in to the template.

This variable is for holding any global template variables or helper functions
which are to be made available to all templates.

For example, if you wanted to add a template helper to pretty-print a `Date`
object using the [moment.js](http://momentjs.com/) library you could create a 
[startup](#startup) step to add it:

```javascript
// file: <app folder>/support/startup/helpers.js

var _ = require('lodash'), 
  moment = require('moment');

module.exports = function*(app) {
  app.locals = _.extend({}, app.locals, {
    prettyDate: function(date) {
      return moment(date).format('dd-mm-yyyy');
    } 
  });
};

// file: <app folder>/config/base.js

module.exports = function(config) {
  ...
  config.startupSteps = [
    'helpers',
    ...
  ];
```

Within your Jade template the `prettyDate` function would now be available:

```jade
#{ prettyDate(mydate) }
```


# Static resources

Waigo uses the [koa-static](https://github.com/koajs/static) middleware to serve
up static resources such as  scipts, stylesheets and fonts needed by the front-
end of your web application.  The default configuration for this middleware is:

```javascript
// <waigo framework>/src/config/base.js
...
config.middleware.options.staticResources = {
  // relative to app folder
  folder: '../public',
  options: {}
};
...
```

Thus if your app folder is located at `/var/www/myapp` then static 
resources are expected to reside in `/var/www/public`.


# Forms

Forms are treated as first-class citizens in Waigo. Form inputs can be sanitized
and validated and a per-field error report can be generated.

Each form uses a unique id; its configuration and input fields are specified in
a file under the `forms/` path, the file name being the id of the form.

For example, here is how you might specify a simple signup form:

```javascript
// in file: forms/signup.js

module.exports = {
  fields: [
    {
      name: 'email',
      type: 'text',
      label: 'Email address'
    },
    {
      name: 'password',
      type: 'password',
      label: 'Password'
    },
    {
      name: 'confirm_password',
      type: 'password',
      label: 'Confirm password'
    }
  ]  
};
```

The field `type` key refers to the name of a module file under the
`support/forms/fields/` path. So for the above form specification Waigo will
expect the following paths to exist:

* `support/forms/fields/text`
* `support/forms/fields/password`

All field type classes inherit from the base `Field` class (found in
`support/forms/field`).

To create an instance of the above form you would do:

```javascript
var waigo = require('waigo'),
  Form = waigo.load('support/forms/form').Form;

var form = Form.new('signup');
```

Waigo will automatically look under the `forms/` file path to see if a form
specification for the given id exists. It so it will load in this specification
and return a `Form` instance.

A `Form` instance can generate a [view object](#view-objects) representation of
itself. It looks  something like:

```javascript
{
  /* form id */
  id: "uniqueFormId",

  /* fields */
  fields: {
    title: {
      type: "text",
      name: "title",
      label: "Title",
      value: null,
      originalValue: null   /* see 'Dirty checking' section for explanation */
    },
    body: {
      type: "text",
      name: "body",
      label: "Body",
      value: null,
      originalValue: null     
    },
    comment: {
      type: "text",
      name: "comment",
      label: "Comment",
      value: null,
      originalValue: null     
    }
  },

  /* the suggested display order for the fields, based on the form spec */
  order: [
    "title",
    "body",
    "comment"
  ]
}
```


## Internal state

Sometimes we may wish to restore a form to a previous state. The form 
architecture allows for this exposing the ability to get and set the form's 
internal state. This state contains the current field values too.

```javascript
// save the form state
var form = Form.new('signup');
yield form.setValues( /* user input values */ );
this.session.formState = form.state;
...
// restore the form (and field values) to previous state
var form = Form.new('signup');
form.state = this.session.formState;
```

We can also set the internal state during construction:

```javascript
var form = Form.new('signup', this.session.formState);
```

## Sanitization

When setting form field values Waigo first sanitizes them. Sanitization is
specified on a per-field basis in the form configuration. Let's trim all user
input to our signup form:

```javascript
// in file: forms/signup.js

module.exports = {
  fields: [
    {
      name: 'email',
      type: 'text',
      label: 'Email address',
      sanitizers: [ 'trim' ]
    },
    {
      name: 'password',
      type: 'password',
      label: 'Password',
      sanitizers: [ 'trim' ]
    },
    {
      name: 'confirm_password',
      type: 'password',
      label: 'Confirm password',
      sanitizers: [ 'trim' ]
    }
  ]  
};
```

Each item in the `sanitizers` array refers to the name of a module file under
the `support/forms/sanitizers/` path. So for the above form specification Waigo
will expect the following path to exist:

* `support/forms/sanitizers/trim`

A sanitizer module should export a single function which returns a generator
function (this performs the actual sanitization). For example, Waigo's built-in
`trim` sanitizer looks like this:

```javascript
var validatorSanitizer = require('validator');

module.exports = function() {
  return function*(form, field, value) {
    return validatorSanitizer.trim(value);
  }
};

```

If sanitization fails then a `FieldSanitizationError` error gets thrown
for the field for which it failed.

The actual sanitization function gets passed a `Form` and `Field` reference
corresponding to the actual form and field it is operating on. This makes it
possible to build complex sanitizers which can query other fields and the form
itself. 

Note that you can set field values without sanitization processing:

```javascript
// without sanitization
form.fields.email.value = 'me@univers.com';

// with sanitization (this will set .value after sanitization is complete)
yield form.fields.email.setSanitizedValue('ram@hiddentao.com');
```

Setting values for multiple fields:

```javascript
// this calls Field.prototype.setSanitizedValue
yield form.setValues({
  email: 'ram@hiddentao.com',
  password: 'test'
});
```

## Validation

Once form field values have been set we can validate them by calling
`Form.prototype.validate()`. Validation is specified on a per-field basis in the
form configuration. Let's validate our signup form:

```javascript
// in file: forms/signup.js

module.exports = {
  fields: [
    {
      name: 'email',
      type: 'text',
      label: 'Email address',
      sanitizers: [ 'trim' ],
      validators: [ 'notEmpty', 'isEmailAddress' ]
    },
    {
      name: 'password',
      type: 'password',
      label: 'Password',
      sanitizers: [ 'trim' ],
      validators: [ 'notEmpty', { id: 'isLength', min: 8 } ]
    },
    {
      name: 'confirm_password',
      type: 'password',
      label: 'Confirm password',
      sanitizers: [ 'trim' ],
      validators: [ { id: 'matchesField', field: 'password' } ]
    }
  ]  
};
```

Each item in the `validators` array refers to the name of a module file under
the `support/forms/validators/` path. When a validator (or even sanitizer) is
specified as an object then its `id` attribute is assumed to be its module file
name. The object itself is assumed to be a set of options to pass to the
module file during initialisation.

So for the above form specification Waigo will expect the following paths to exist:

* `support/forms/validators/notEmpty`
* `support/forms/validators/isLength`
* `support/forms/validators/matchesField`

A validator module exports a single function which should return a generator
function (this performs the actual validation). For example, Waigo's built-in
`isEmailAddress` validator looks like this:

```javascript
var validator = require('validator');

module.exports = function() {
  return function*(form, field, value) {
    if (!validator.isEmail(value)) {
      throw new Error('Must be an email address');
    }
  }
};

```

The actual validation function gets passed a `Form` and `Field` reference
corresponding to the actual form and field it is operating on. This makes it
possible to build complex validators which can query other fields and the form
itself.

## Validation errors

Validaton error reporting is very comprehensive and makes it easy to show the
end-user exactly what failed to validate and why.

This is what happens when `Form.prototype.validate()` gets called:

1. `Field.prototype.validate()` gets called for each field belonging to the form.
2. For each field every validator gets run and all validation errors are 
grouped together within a single `FieldValidationError` instance. 
3. In `Form.prototype.validate()` all field validation errors are grouped 
together within a single `FormValidationError` instance. 

When sending this error object back to the client it's view object 
representation gets generated and looks something like:

```javascript
{
  type: 'FormValidationError',
  msg: 'Form validation failed',
  errors: {
    field1: {
      type: 'FieldValidationError',
      msg: 'Field validation failed',
      errors: {
        notEmpty: {
          type: 'Error',
          msg: 'Must not be empty'
        },
        isEmailAddress: {
          type: 'RuntimeError',
          msg: 'Must be email address'
        },
        ...
      }
    },
    ...
  }
}
```

Sometimes you might not need such detail and may simply wish to display the 
specific error messages associated with each field. In such cases set the 
following inside your controller, prior to rendering output:

```javascript
this.request.leanErrors = true;
```

The final view object will look like:

```javascript
{
  type: 'FormValidationError',
  msg: 'Form validation failed',
  fields: {
    field1: [
      'Must not be empty',
      'Must be email address',
      ...
    ],
    ...
  }
}
```

## Dirty checking

Form fields have two types of values - _original values_ and _current values_. 
Sanitization and validation takes place on a form's current values, and these 
are the values input by the user. 

Original values on the other hand are meant to represent the original 
values of the form's various input fields when the form gets displayed to 
the user. You are not forced to set or use original values, but they're 
useful if you wish to check whether the user made any changes to the form.

Every `Field` instance exposes an `isDirty()` method to check whether the
current value differs from the original value. Every `Form` instance also
exposes this method, which simply calls through to the same for every one of
its  fields. If even one field is dirty then the form is considered dirty.

Let's see how this works in pracice...

Say the user signed up to our site with a name and telephone number. They wish 
to edit these details. The form for this:

```javascript
// file: <app folder>/forms/editProfile.js

{
  id: 'editProfile',
  fields: [
    {
      name: 'name',
      type: 'text',
      sanitizers: [ 'trim' ],
      validators: [ 'notEmpty' ]
    },
    {
      name: 'phone',
      type: 'text',
      sanitizers: [ 'trim' ],
      validators: [ 'notEmpty', 'isPhoneNumber' ]
    }
  ]  
}
```

When the user submits the form we wish to find out whether they have made any 
changes. In the route handler which processes the user submission we might have:

```javascript
// file: <app folder>/controllers/profile.js

exports.updateProfile = function*(next) {
  var model = {
    name: //...existing name...
    phone: //...exiting phone number...
  };  

  try {
    var form = Form.new('editProfile');
    yield form.setOriginalValues(model);
    yield form.setValues(this.request.body);
    yield form.validate();

    if (form.isDirty()) {
      //...update model data and persist...
    }

    this.response.redirect('/profile');
  } catch (err) {
    //...handle sanitization, validation errors, etc...
  }
};
```

In the above controller method we only update the model data and persist it if 
if has actually changed. Thus 'dirty checking' allows us to be efficient with 
updates.


# Logging

Waigo provides support for [winston](https://github.com/flatiron/winston) by
default. The default Winston logging target (see `config/base`) is the console.
All uncaught exceptions and `error` events emitted on the koa app object get
logged in this way.

You don't have to use Winston - you can use any logging library you want. The
`app.config.logging` configuration object both specifies the name of a logger
(to be loaded from the `support/logging` path) and configuration to pass to that
logger.

# Errors

The `support/middleware/errorHandler` middleware is responsible for handling all
errors which get thrown during the request handling process. Errors get logged
through the default logger as well as getting sent back to the client which made
the original request.

## RuntimeError

Waigo provides a base error class - `RuntimeError` - which allows you to set a
HTTP status code along with the error message. This status code is used by the
error handling middleware when sending the final error response to the client:

```javascript
// file: <app folder>/controllers/main.js

var waigo = require('waigo'),
  errors = waigo.load('support/errors'),
  RuntimeError = errors.RuntimeError;

exports.index = function*(next) {
  throw new RuntimeError('oh dear!', 400); // 400 = bad request
}
```

**Always try and use `RuntimeError` insted of `Error` as it provides for more 
descriptive output.**

A request handled by the above route handler would result in a HTTP status code 
of 400 being returned to the client along with the error message:

```javascript
{
  type: RuntimeError,
  msg: 'oh dear!',
  stack: ....stack trace
}
```

_Note: Stack traces only get sent to the client if the
`app.config.errorHandler.showStack` flag is turned on._

## MultipleError

The `MultipleError` class represents a group of related errors. It inherits from
`RuntimeError`. As well as message and  status code its constructor also accepts
a collection of `Error` objects. 

The view object representation of a `MultipleError` includes the view object 
representations of all of its encapsulated errors. For example, given:

```javascript
throw new MultipleError('oh dear!', 400, {
  firstError: new RuntimeError('fail1'),
  secondError: new Error('test')
});
```

The response to the client would look like:

```javascript
{
  type: MultipleError,
  msg: 'oh dear!',
  errors: {
    firstErrror: {
      type: 'RuntimeError',
      msg: 'fail1'
    },
    secondError: {
      type: 'Error',
      msg: 'test'
    } 
  }
}
```

_Note: The [form and field validation error](#validation) classes inherit from
`MultipleError`._

## Custom errors

It is highly recommended that you define and use your own error classes as they
will allow you to better poinpoint the cause of errors. The `support/errors`
module provides functionality to make this easy:

```javascript
var errors = waigo.load('support/errors');

var UserNotFound = errors.define('FormValidationError');
// UserNotFound inherits from RuntimeError

...

throw UserNotFound('...');
```

The second parameter to the `define()` call is the parent class to inherit 
from. A custom error class can even inherit from another one:

```javascript
var errors = waigo.load('support/errors');

var ProcessingErrors = errors.define('ProcessingErrors', errors.MultipleError);
// ProcessingErrors inherits from MultipleError

var ValidationErrors = errors.define('ValidationErrors', ProcessingErrors);
// ValidationErrors inherits from ProcessingErrors
```

# Debugging

In order to fix a problem it's sometimes useful to know what's going on inside the framework.

Waigo makes use of the [debug](https://github.com/visionmedia/debug) utility
internally in some parts. For instance, to debug the  [loading system](#extend-and-override) 
run your app with the `DEBUG` environment variable as follows:

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

# Roadmap

See the [Github issue queue](https://github.com/waigo/waigo/issues).


# Contributing

Suggestions, bug reports and pull requests are welcome. Please see [CONTRIBUTING.md](https://github.com/waigo/waigo/blob/master/CONTRIBUTING.md) for guidelines.

# License

MIT - see [LICENSE.md](https://github.com/waigo/waigo/blob/master/LICENSE.md)

