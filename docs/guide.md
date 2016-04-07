# What is Waigo?

Waigo is a Node.js framework for building **reactive**, **scalable** and 
**maintainable** web application back-ends.

Quick overview:

 * Based on [koa](http://koajs.com/), uses promises and ES6 generators - no callbacks
 * Comes with [Node.js clustering](#scalable-clustering) enabled by default for scalability
 * Front-end agnostic - build whatever kind of front-end you want
 * [Reactive data](#reactive-data) model layer
 * Easily build REST/JSON APIs using [output formats](#views-and-output-formats)
 * Flexible routing with [per-route](#routing) and [per-http-method](#routing) middleware customisation
 * Built-in [user account](#user-accounts) management + [OAuth](#oauth) support
 * Flexible user [access control](#access-control) list with reactive updates
 * Easily build [forms](#forms) and process submissions with customizable validation
 * Built-in [cron job](#cron) functionality
 * Ready-made [admin dashboard](#admin-dashboard) which is fully customizable
 * Command-line interface for [easy setup](#getting-started)
 * [Extend](#extend-and-override) or override _any_ part of the core framework
 * Bundle up functionality into re-usable [plugins](#plugins)
 * And much, much more...keep reading!
 

# Why should I use Waigo?

Waigo provides you with a sensible directory layout for your Koa app and a clean architecture. It also comes with a bunch of basic boilerplate features that almost every site needs. 

But the best part is that you don't have to use anything you don't want to. Almost every part of Waigo can be **cleanly** [extended and overridden](#extend-and-override) within your app. Waigo gets out of your way when you need it to.

In addition to this, if you do build some functionality you wish to share between different Waigo projects you can make it re-usable by bundling it up as a [plugin](#plugins). Check out the [current list of plugins](https://www.npmjs.org/browse/keyword/waigo) to see what's already available.

# Getting started

## Installation

Waigo requires **Node.js v4 or above** and **RethinkDB** (this is the default supported database). Install these on your system with the default settings.

Waigo comes with a [command-line interface](#command-line) (CLI). It's best to install Waigo as a global NPM module so that you can easily use this tool.

```bash
$ npm install -g waigo
```

## Running it

If your app folder is located at e.g. `/dev/myapp` then Waigo will by 
default assume that the source code for your app will be located in a 
`src` subfolder, i.e. at `/dev/myapp/src`.

Inside your app folder run the following command:

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
```

You will see something like:

```bash
(RamMacbookPro.local-78163) [2016-04-06 11:01:41.450] [INFO] [app] - Startup complete
```

You may notice repeated lines in the output. This is due to the [scalable clustering](#scalable-clustering) mechanism in Waigo. 

# Scalable clustering

Waigo uses [Node's built-in clustering](https://nodejs.org/api/cluster.html) mechanim to automatically launch as many instances as there as cores in your CPU. This is to utilize your CPU as maximally as possible for scalability purposes. This is why during the startup phase you may see what look like repeated logs. 

However, every log line is prefixed with the pid of the specific worker doing the logging:

```bash
[worker1] started, pid: 78163
[worker2] started, pid: 78164
[worker3] started, pid: 78166
...
(RamMacbookPro.local-78164) [2016-04-06 11:01:41.413] [INFO] [app] - Startup complete
(RamMacbookPro.local-78166) [2016-04-06 11:01:41.438] [INFO] [app] - Startup complete
(RamMacbookPro.local-78163) [2016-04-06 11:01:41.450] [INFO] [app] - Startup complete
```

Clustering has implications for how you structure your application. When a frontend client requests a backend resource it does not know which specific worker process will serve it. 

Thus, **application-level data should not be stored within the Node.js worker process, but within an externally accessible datasource instead, e.g. the database.**

If you adhere to this rule you will be able to easily scale your application and even have instances of it running on other servers without there being any problems.

If you wish to disable auto-clustering or change the no. of workers which get launched you can do so using the `WAIGO_WORKERS` environment variable:

```bash
$ WAIGO_WORKERS=1 ./start-app.js 
```

The above call will launch the app with just a single worker process. Note that even in this case 2 processes will be launched - the main parent process and the single worker process. The main parent process does not process requests or do anything special - it simply manages the worker processes.


# Extend and Override

In this section we will demonstrate how you can cleanly override almost all the default functionality provided by Waigo.

Let's look at the default controller provided by Waigo, at `<waigo npm folder>/src/controllers/index.js`:

```javascript
"use strict";

/**
 * @fileOverview Main controller
 */

exports.main = function*() {
  yield this.render('index');
};
```

Inside your app folder create `src/controllers/index.js`:

```javascript
// file: <app folder>/src/controllers/index.js

exports.main = function*() {
  this.body = 'Hello world!';
};
```

Now restart the app and refresh the page in the browser. You should see _Hello world!_ printed on screen.

In order to understand why this happened we need to understand what Waigo's module loader is and how it works.

## Module loader

During the startup phase Waigo will index its NPM module folder, [plugin](#plugins) folders and finally your app folder for all `.js` files. 

When a particular file needs to be loaded at runtime the convention is to call `waigo.load()` with the relative path to the file. In the above example Waigo will internally call `waigo.load("controllers/index")` to load the `index` controller. At this point the actual file which gets loaded and returned will be based on the first available location, in order:

* `<app folder>/src/controllers/index.js`
* `<plugin1 npm module>/src/controllers/index.js`
* `<plugin2 npm module>/src/controllers/index.js`
* ...
* `<waigo npm module folder>/src/controllers/index.js`

This loading mechanism allows you to:

1. Only load the parts of the framework you will actually use _(good for 
performance)_.
2. Override any framework module file with your own version _(extendability 
and customisation)_.

But what if you specifically wanted the version of the `index` conroller provided by the Waigo framework? Just prefix `waigo:` to the module file name:

```javascript
// this will load the version of controllers/index.js provided 
// by Waigo and not the one provided by your app
waigo.load('waigo:controllers/index');   
```

If you wish to load the version from within a plugin then simply specify that plugin's NPM module name as the prefix, e.g:

```javascript
// this will load the version of controllers/index.js provided 
// by plugin1 and not the one provided by your app or Waigo
waigo.load('plugin1:controllers/index');   
```

The above selective loading mechanism allows you to _extend_ and not simply override. For instance, you could extend the the `index` controller as follows:

```javascript
var waigo = require('waigo');

// export all methods from Waigo framework index controller
module.exports = waigo.load('waigo:controllers/index');    

// add more methods
exports.handleSubmission = function*() {... }
```

Note that the module loader also scans for [view templates](#views-and-output-formats), allowing you to re-use view templates provided by the Waigo framework and plugins. However the module loader does not scan the following sub paths within each folder tree:

* `src/views/emailTemplates` - [mailer](#email-system) templates
* `src/frontend` - all frontend stuff
* `cli/data` - data for use by [cli](#command-line) commands


## Plugins

As mentioned earlier, You can make anything you build re-useable by bundling it 
up as a plugin. Plugins are just NPM modules and are thus very easy to share with others, and come with all the benefits that are available to normal NPM modules.

By separating non-core functionality into plugins (which can then be thoroughly 
documented and tested) we encourage code re-use across projects. Plugins help to keep the core Waigo framework more focussed, flexible and increase the overall quality of code in the Waigo ecosystem.


### Loading plugins

Waigo automatically tries to work out what plugins are 
available by loading in the `package.json` file. By default it searches the 
`dependencies`, `devDependencies` and `peerDependencies` lists for any modules 
which are prefixed with `waigo-` and assumes that these are plugins which 
should be loaded.

However you can override every aspect of this search. The [waigo.init()](https://github.com/waigo/waigo/blob/master/src/loader.js) method gives you the available options:

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

You can list the desired plugins in a config file of your 
choosing and then supply the path to this file. Or you can directly supply a 
config `Object` itself. And you can override the plugin naming conventions.


### Example

The [waigo-sitemap](https://www.npmjs.org/package/waigo-sitemap) plugin adds a cron job which submits a sitemap for your site to Google and Bing once a day. It provides the following modules files:

* `src/support/cronTasks/submitSitemap.js`

To get the plugin use `npm`:

```bash
# --save ensures it gets added as dependency in package.json (so that Waigo will find it)
npm install --save waigo-sitemap 
```


You can of course override any module file the plugin provides with your own:

```javascript
// file: <app folder>/src/support/cronTasks/submitSitemap.js

module.exports = {
  schedule: '0 0 0 * * *',  // every day at midnight
  handler: function*(app) {
  	console.log('do nothing!');
  }
};
```

Calls made to `waigo.load('support/cronTasks/submitSitemap')` will now load your app version 
rather then the plugin version.

### Plugin conflicts

What would happen if you had two plugins which both provided the same
file? in this case the call to `waigo.init()` would fail with an error:

```bash
Error: Path "path/to/file" has more than one plugin implementation to choose from: waigo-plugin1, waigo-plugin2, ...
```

If you need to use both plugins (maybe because they provide other useful
functionality) then pick which plugin's implementation you want to use by
providing a version of the file within your app folder. For
example, if you wanted Waigo to use the implementation provided by `waigo-
plugin1` then you would do:

```javascript
// file: <app folder>/path/to/file

var waigo = require('waigo');

// use the implementation from waigo-plugin1
module.exports = waigo.load('waigo-plugin1:path/to/file');    
```


### Publishing

To create and publish your own plugin to the wider community please follow 
these guidelines:

* Check to see if what you've made is worth putting into a plugin. For instance 
it's very easy to re-use existing [koa](http://koajs.com) middleware in Waigo without 
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

In the [Getting Started](#getting-started) section you used the Waigo command-line interface (CLI) to get a 
working application up and running. 

Even if you install Waigo globally in order to use the CLI, it's smart enough to delegate control to your local 
installation of Waigo (in your `node_modules` folder) if one is present.

The available CLI commands can be seen by typing:

```bash
$ waigo --help

  Usage: waigo [options] [command]

  Commands:

    init-gulp   Initialise and create a skeleton Gulpfile and associated tasks
    init        Initialise and create a skeleton Waigo app

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

The `<waigo npm folder>/src/cli/data` folder contains 
any data to be used the CLI commands (e.g. script templates) and does not get 
scanned by the Waigo [module loader](#module-loader). 

## Custom commands

Every CLI command is implemented a file within `<waigo npm folder>/src/cli`. If you wish to add your own commands or override the defaults then you must also place your implementations within `<app folder>/src/cli`. The 
CLI executable scans this path at startup and loads in all available commands. 

All CLI commands must be implemented as concrete subclasses of 
[`AbstractCommand`](https://github.com/waigo/waigo/blob/master/src/support/cliCommand.js). This 
base class provides a number of useful utility methods for use by actual 
commands.



# Configuration

Configuration for your application is loaded during [startup](#startup) and is 
always accessible at `app.config` within your backend code and through the `config` variable within your view templates.

The `src/config` folder path holds the configuration files.
Each configuration file exports a function which accepts the current
configuration object as a parameter. This object can then be modified:

```javascript
module.exports = function(config) {
  // modify config in here
};
```

Each successively loaded configuration file gets passed the same configuration
object. As we'll see in the next section this makes it easy to customise the
application configuration depending on the mode in which we're running in -
production, testing, etc.

## File load order

The `config/index.js` file is the configuration loader. It looks for and 
loads configuration files in the following order:

1. `config/base.js` - **required**
2. `config/<NODE_ENV>.js`
3. `config/<NODE_ENV>.<current user>.js`

The `config/base.js` file sets the configuration common to all modes in 
which the application may run.

The configuration module files following this one are optional. Which ones get
loaded depends on the value of the `NODE_ENV` environment variable. If this is
not set then we assume its value to be `development`.

_Note: When running your application in a production environment ensure you
set the `NODE_ENV` environment variable to `production` or something similar._

The final configuration file which gets loaded is associated with the mode in 
which the application is running as well as the id of the user who is 
executing the current application. This conveniently allows different users to 
further customise the configuration according to their own needs.

Let's look at a concrete example...

Let's say `NODE_ENV` is set to `test` mode and that the user id of the process 
is `www-data`. The configuration loader will initialise a configuration object and then pass it to each of the following files in the 
given order:
 
1. `config/base.js`
1. `config/test.js`
2. `config/test.www-data.js`

_Note: Once stared the application mode is accessible at `config.user`and the id of the user owning the process at `config.user`._


## Re-using framework version

Let's say we want to provide `config/base.js` in our app but that we want to re-use
some of the configuration provided by Waigo's version of this file. We can easily do this as follows:

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



# Startup and Shutdown

When the application starts up, Waigo runs the configured startup steps.

```javascript
// file: <waigo npm module>/src/application.js

App.start = function*(...) {
  ...

  for (let stepName of app.config.startupSteps) {
    ...
    yield* waigo.load('support/startup/' + stepName)(app);
  }
};
```

Startup modules are responsible for initialising the
various aspects of your application. For example, here is the `middleware`
startup step:


```javascript
// file: <waigo npm module>/src/support/startup/middleware.js

module.exports = function*(app) {
  app.logger.debug('Setting up common middleware');

  for (let m of app.config.middleware.ALL._order) {
    app.logger.debug(`Loading middleware: ${m}`);

    app.use(waigo.load(`support/middleware/${m}`)(
      _.get(app.config.middleware.ALL, m, {})
    ));
  }
};
```

This particular startup step sets up the middleware that will apply to *all*
incoming requests. 

You set which startup steps get run by editing your config:

```javascript
// file:	<app folder>/src/config/base.js

module.exports = function(config) {
	...
	config.startupSteps = [
		'step1',
		'step2',
		'step3',
	];	
	...
}
```

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
by creating/modifying the appropriate configuration file:

```javascript
// file:  <app folder>/src/config/development.js

module.exports = function(config) {
  config.startupSteps = [
    'logging',
    'middleware',
    'routes',
    'listener',
    'timeAndDate'
  ];
};
```

## Default steps

The following startup steps come with Waigo:

* `database`- This sets up the [database](#database-and-models) connection using the configuration found at `app.config.db`.
* `models` - This sets up [data model](#reactive-data) instances based on files found under `models/`.
* `forms`- This sets up convenient accessors for using [forms](#forms).
* `activityRecorder` - This sets up convenient accessor for recording activities to the [activity stream](#activity-stream).
application folder.
* `acl` - Sets up the [access control](#access-control) list.
* `middleware` - This sets up the default [middleware](#middleware) which gets executed for every request.
* `routes` - This maps URL [routes](#routing) to their handlers.
* `staticResources` - This sets up the static resources folder and copies Waigo framework-level frontend assets into it.
* `actionTokens` - This sets up the interface for [action tokens](#access-tokens).
* `mailer` - [Email system](#email-system) setup.
* `cron` - Sets up [cron jobs](#cron-jobs) system.
* `appTemplateVars` - Ensures useful data (e.g. `app.config`) gets exposed to app view templates.
* `listener` - This starts the HTTP server and is usually the last start step to be run.

## Shutdown steps

Similar to startup steps, Waigo also has _shutdown steps_ - tasks which 
get executed when `waigo.load('application').shutdown()` is called. 

Shutdown steps especially useful to have if you're doing automated tests with a Waigo app and need start and stop an app multiple times.

The default shutdown steps can all be found under the `support/shutdown` file path:

* `database`- This closes the [database](#database-and-models) connection.
* `listener` - This stops the HTTP server.


# Routing

Waigo's router provides a user-friendly mapping syntax as well as per-route and per-sub-route middleware customisation. Routes are specified in files under the `routes/` path and are processed once by the `routes` startup step. 

An example:

```javascript
// file: <waigo npm folder>/src/routes/admin.js

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

The above route mapping specifies the following:

* The base path is `/admin`
* The `/admin` path and all of its subpaths will have 2 common middleware applied:
  * `waigo.load('support/middleware/assertUser')`  - will check that the user is logged in.
  * `waigo.load('controllers/admin/index').configureMenu)` - will configure the admin menu for rendering.
* `GET /admin` will be handled by `waigo.load('controllers/admin/index').main`.
* The `/admin/routes` path and all of its subpaths will have 1 common middlware applied:
  * `waigo.load('support/middleware/assertUser')({canAccess: 'admin'})` - will check that the user is an admin.
* `GET /admin/routes` will be handled by  `waigo.load('controllers/admin/routes').index`.

In general, if the middleware name has a period (`.`) within it then it is assumed to
refer to a controller file path and a the name of a method within the controller. Otherwise it is
assumed to be the name of a [middleware](#middleware) file.

If we wanted to we could also specify a middleware "chain" for a particular individual route and HTTP method, e.g we can rewrite the above route mappings as follows:


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


_Note: Parameterized and regex routing is also supported. See [trie-
router](https://github.com/koajs/trie-router) for more information._



# Middleware

Waigo middleware works the same as Koa middleware. All middleware module files
can be found under the `support/middleware` path. Additional middleware provided
by your app and/or plugins should also sit under this path.

A middleware module file is expected to export an "initializer" function which,
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

The [app configuration](#configuration) file may specify middleware that is to apply to all incoming requests. For example:

```javascript
// file:	<app folder>/src/config/base.js

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

Controllers can be nested within subfolders within the `controllers` path. For example, Waigo's default [admin dashboard](#admin-dashboard) controllers are located at:

* `<waigo npm folder>/src/controllers/admin/index.js`
* `<waigo npm folder>/src/controllers/admin/routes.js`
* ...

To load the admin `routes` controller:

```javascript
waigo.load('controllers/admin/routes');
```


# Database and Models

At present Waigo comes with a built-in database connector and 4 built-in models:

* `User` - represents a [user account](#user-accounts).
* `Activity` - represents an event in the [activity stream](#activity-stream).
* `Acl` - represents an entry in the [access control list](#access-control).
* `Cron` - represents a scheduled cron job.

As with everything else in Waigo you can choose to extend or replace these models with your own, or use a completely different model layer of your choosing.

## Database connection

_Note: At present only RethinkDB is supported. Mongo support is in the pipeline._

The `database` [startup](#startup-and-shutdown) step is responsible for creating a connection to databases. It gets its configuration information from `app.config.db`:

```javascript
// file: <app folder>/src/config.base.js

module.exports = function(config) {
  ...
  config.db = {
    mydb: {
      type: 'rethinkdb',
      serverConfig: {
        db: 'waigo',
        servers: [
          {
            host: '127.0.0.1',
            port: 28015,
          }
        ],
      }
    }
  };
  ...
};
```

The above configuration tells Waigo to create a connection called `mydb` to a RethinkDB database named `waigo`, with a single server to connect to - `127.0.0.1:28015`. Waigo internally relies on [rethinkdbdash](https://github.com/neumino/rethinkdbdash) for managing the connections.

Once setup, this database connection will be accessible at `app.dbs.mydb`.

It is possible to connect to multiple databases within a single app, e.g:

```javascript
// file: <app folder>/src/config.base.js

module.exports = function(config) {
  ...
  config.db = {
    primary: {
      type: 'rethinkdb',
      serverConfig: {
        db: 'waigo',
        servers: [
          {
            host: '127.0.0.1',
            port: 28015,
          }
        ],
      }
    },
    secondary: {
      type: 'rethinkdb',
      serverConfig: {
        db: 'logs',
        servers: [
          {
            host: '127.0.0.1',
            port: 28016,
          }
        ],
      }
    }        
  };
  ...
};
```

Regardless of the no. of database connections specified, the first connection is always considered to be the main one, and will be made accessible at `app.db` (i.e. `app.db === app.dbs.primary` in the above example).


## Using models




## Reactive data




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
// file: forms/signup.js

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
// file: forms/signup.js

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
// file: forms/signup.js

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

# Access Control



# Admin dashboard

Waigo comes bundled with a basic administration interface. Once you have the default site running (as explained above) you should be able to visit `/admin` in your browser. You will be prompted to login.

Since you've just started the server for the first time you don't yet have any user accounts. So choose to register one. 

**The first user account you register is automatically given admin access rights, so that you can login to the administration interface**.

If you wish to grant admin access to other users in future you will need to [assign the `admin` role](#access-control) to those users manually.

Once you've gained access to the admin dashboard you will be able to do things like test the app's routes and enable/disable cron jobs. 

## Customization

The admin dashboard layout (and particularly the nav menu) is auto-generated from the admin configuration. If you open up `<waigo npm module>/src/config/base.js` you will see:

```javascript
  config.adminMenu = [
    {
      label: 'Dashboard',
      path: '/admin',
    },
    {
      label: 'Routes',
      path: '/admin/routes',
      canAccess: 'admin',
    },
    {
      label: 'Cron tasks',
      path: '/admin/cron',
      canAccess: 'admin',
    },
  ];
```

Thus you can see how easy it is enable/disable specific modules and/or add your own with their own routing path.

Note that if you specify your own URL paths you will need to ensure that they have the correct [access](#access-control) permissions set on them. The default admin routes all fall under `/admin` and are restricted to `admin` users only, as you can see if you open up `<waigo npm module>/src/routes/admin.js`:

```javascript
module.exports = { 
  '/admin': {
    pre: [
      { 
        id: 'assertUser', 
        redirectToLogin: true,
      },
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
```

By overriding this file in your app you can change the admin routing permissions and/or disable admin access altogether.




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





To find out more about this and how you can configure it check out the [Scalable Clustering](#scalable-clustering) section of this guide.


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
