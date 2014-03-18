# What is Waigo?

[![Build Status](https://secure.travis-ci.org/waigo/waigo.png)](http://travis-ci.org/waigo/waigo) [![NPM module](https://badge.fury.io/js/waigo.png)](https://npmjs.org/package/waigo) [![Code quality](https://codeclimate.com/github/waigo/waigo.png)](https://codeclimate.com/github/waigo/waigo)

Waigo is a flexible MVC framework for building scalable and maintainable web applications.

Based on [koa](http://koajs.com), it uses [generators](http://tobyho.com/2013/06/16/what-are-generators/) for asynchronous programming, removing the need for callbacks. Almost every aspect of the core framework can be easily extended or overridden.

This documentation (along with API docs) is available at [waigojs.com](http://waigojs.com).

**Waigo is still in beta (pre-1.0) so expect things to break!**

# Why should I use Waigo?

There are numerous ways in which Waigo kicks ass, all detailed in this guide. But here are the top 2 reasons...

**1. Waigo makes it easy to build a well structured and maintainable web application.**

Waigo keeps it simple. It exposes koa's existing routing and middleware architecture but provides a mechanism for cleanly defining routes separately to controllers and also makes it easy to [customize the middleware](#routing) to use on a route-by-route basis.

Almost all web application at some point need to process form input. Waigo makes this easy by providing a simple yet scalable form creation and validation system with fine-grained [per-field error reporting](#forms).

Waigo doesn't come with a built-in model layer - modern ORM and ODM libraries are often comprehensive enough to handle the model layer. So whether it's flat files, Mongo DB or MySQL, use whatever you fancy.

Nowadays most web apps often have single-page web versions and/or mobile apps which need to use a REST API or the equivalent to communicate with the back-end. Waigo supports more than one [output format](#views-and-output-formats), allowing you to serve both plain-old web browser and also REST API clients using the same controller code.

**2. Waigo gets out of you way when you need it to**

It's great that Waigo provides so many useful features. But what if you don't like the way it does something? 

Experience working with other web frameworks has taught us that it's better not to force a particular way of doing things as there often comes a point where the framework's way of doing things isn't suitable. Ugly hacks are then usually required to get things working the way they need to.

Waigo lets you easily [override the core functionality](#extend-and-override) in your app and make it work the way you want. All core functionality in Waigo (except the module loader - see below) can be cleanly overridden in this way. No ugly framework hacks are needed!

# Why should I not use Waigo?

There are no major reasons for not using Waigo since it is designed to be a general purpose web framework. With that said...

* Although performance has been taken into consideration in building Waigo (e.g. see [form fields](#form-fields)), [current performance benchmarks](http://spion.github.io/posts/why-i-am-switching-to-promises.html) show that using callbacks is still slightly faster and uses less memory than using generators. This may be important to you, though do note that in real web apps the coding style is rarely ever the performance bottleneck.

* At the moment Waigo does not provide anything to make doing real-time web app (e.g. using Websockets) easier. Waigo is evolving and improving according to the needs of its users. If you think you can build a great real-time stack with Waigo then feel free to [write a plugin](#plugins) or raise a [pull request](https://github.com/waigo/waigo/issues).


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

If your app folder is located at e.g. `/dev/myapp` then Waigo will by default assume that the source code for your app is located in a `src` subfolder, i.e. at `/dev/myapp/src`.

Create a new Javascript file in your app's source folder with the following contents:

```javascript
// file: <app folder>/src/server.js

var Promise = require('bluebird'),
  waigo = require('waigo');

// Generator co-routine
Promise.spawn(function*() {
  // Initialise waigo module loading system
  yield* waigo.init();
  // Start the server
  yield* waigo.load('app').start();
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
$ node --harmony server.js
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
HTML and JSON output, and more [output formats](#views-and-output-formats) can be easily added.

# Extend and Override

In the "Hello World" example above you will have noticed:

```javascript
waigo.load('app')
```

When you want to use something provided by the framework you first have to load its module file through `waigo.load()`. This allows you to:

1. Only load the parts of the framework you will actually use _(performance)_.
2. **Override any framework module file with your own version** _(extendability and customization)_.

When you want to load the `app` module file (as above) the loader will look for it in the following locations:

1. `<app folder>/src/app.js`
2. `<waigo npm module folder>/src/app.js`

_Note: if you have [plugins](#plugins) installed their paths will also be searched._

So if you provide a `app.js` within your app's folder tree then Waigo will use that instead of the default one provided by the framework. This rules applies to **every** module file within the framework. 

Thus if you don't like something provided by Waigo you can easily override it. But what if you specifically wanted the version of `app.js` provided by the framework? Just prefix `waigo:` to the module file name:

```javascript
// this will load the version of app.js provided by Waigo, and not the one provided by your app
waigo.load('waigo:app');   
```

This also means you don't have to completely override the framework version. You can also _extend_ it:

```javascript
// in file: <app folder>/src/app.js

var waigo = require('waigo');

// load in Waigo framework version of app.js
module.exports = waigo.load('waigo:app');    

// override start()
exports.start = function*() {...}   
```

Going back to the small "Hello world" example we built above, there is another call we make:

```javascript
yield* waigo.init();
```

Waigo works out which module files are available in the call to `waigo.init()`. It does this so that:

1. Subsequent calls to `waigo.load()` are fast _(node's `require()` already caches loaded modules but having this extra optimisation doesn't hurt)_.
2. It can catch any [plugin conflicts](#plugins) at startup _(rather than later on, when your app is already running)_.

_Note: The `.init()` method scanning for `.js` files in the folder trees of the framework, plugins as well as your app. It is thus recommended that your app's folder tree only contain code that will run in node. Place your front-end scrips in a different folder._

## Plugins

You may wish to re-use functionality between different Waigo-based apps. In which case you can place such code into an NPM module - this is essentially what a _plugin_ is. 

To load a plugin at startup simply `npm install` it and then add it to one of either `dependencies`, `devDependencies` or `peerDependencies` within your `package.json` file. When `waigo.init()` is called Waigo will automatically scan `package.json` to get all plugins (by default it considers anything prefixed with `waigo-` as a plugin). It will then scan each plugin's `src` folder 
tree for available module files and register them internally.

Let's say you have a plugin - `waigo-mongo` - which enables the use of MongoDB database connections. And let's say it provides the following module file: `support/db/mongo.js`.

One `waigo.init()` has been called, if you then call `waigo.load('support/db/mongo')` the system will load the module file from the plugin module's `src` folder. If you were to now create `support/db/mongo.js` within your app's source folder tree then the app version would take precendence over the plugin version. 

Strictly speaking, location precendence is as follows: **App > Plugins > Waigo framework**.

What would happen if you had two plugins which both provided the same module file? in this case the call to `waigo.init()` would fail with 
an error which looks like the following:

```bash
Error: Module "support/db/mongo" has more than one plugin implementation to choose from: waigo-plugin1, waigo-plugin2, ...
```

If you don't want to remove one of the offending plugins then pick which plugin's implementation you want to use by providing a version of the module file within your app's source folder tree. For example, if you wanted Waigo to use the implementation provided by `waigo-plugin1` then you would do:

```javascript
// in file: <app folder>/src/support/db/mongo.js

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

# Startup

Then the application starts up and `waigo.load('app').start()` is called Waigo executes the following:

```javascript
// file: <waigo framework>/src/app.js


app.loadConfig = function*() {
  debug('Loading configuration');
  app.config = waigo.load('config/index')();
};


app.start = function*() {
  yield* app.loadConfig();

  var ret = null;
  for (let idx in app.config.startupSteps) {
    let stepName = app.config.startupSteps[idx];
    debug('Running startup step: ' + stepName);
    ret = yield* waigo.load('support/startup/' + stepName)(app);
  }

  return ret;
};
```

As you can Waigo first loads in the app [configuration](#configuration). Once loaded it finds out which startup modules to load by checking `app.config.startupSteps`. Startup modules are responsible for initialising the various aspects of your application. For example, here is the `middleware` startup step:


```javascript
// file: <waigo framework>/src/support/startup/middleware.js

module.exports = function*(app) {
  for (let idx in app.config.middleware) {
    let m = app.config.middleware[idx];
    debug('Setting up middleware: ' + m.id);
    app.use(waigo.load('support/middleware/' + m.id)(m.options));
  }
};
```

This particular startup step sets up the middleware that will apply to all incoming requests _(you can of course add additional middleware steps in the [routing configuration](#routing)_.

The default startup steps can all be found under the `support/startup` file path and can all be overridden within your app. And of course, you can add your own startup steps. 

For example, lets add a step which simply outputs the current date and time:

```javascript
// file:  <app folder>/src/support/startup/timeAndDate.js

mdoule.exports = function*(app) {
  console.log(new Date().toString());
};
```

We then tell Waigo to load and execute this startup step by modifying the configuration:

```javascript
// file:  <app folder>/src/config/development.js

exports.startupSteps = [
  'logging',
  'database',
  'middleware',
  'routes',
  'listener',
  'timeAndDate'
];
```


## Configuration

Configuration info is loaded during [startup](#startup) into the Koa app object and is always accessible at `app.config`.

The `config` folder holds the configuration files. The `base` module file gets loaded first. Additional configuration modules then get loaded in the following order:
 
1. `config/<node environment>`
2. `config/<node environment>.<current user>`

Thus if node is running in `test` mode (i.e. `NODE_ENVIRONMENT=test`) and the user id of the process is `www-data` then the loader 
looks for the following module files and loads them if present, in the following order:
 
1. `waigo.load('config/base')`
1. `waigo.load('config/test')`
2. `waigo.load('config/test.www-data')`

The configuration object gets _extended_ with each subsequently loaded config module file. This means that in each subsequent file you only need to override the configuration properties that differ.

For example, let's say our production site URL is usually `http://example.com`:

```javascript
// file: <app folder>/src/config/base.js

module.exports = waigo.load('waigo:config/base');

exports.baseURL = 'http://example.com'

exports.port = 80;
```

When running the site on our devbox in `development` mode we might wish to use a different URL as such:

```javascript
// file: <app folder>/src/config/development.js

exports.baseURL = 'http://dev.example.com'
```

The `app.config.port` will still be `80` when running in `development` mode since we didn't override and change it in the `development` config file. The same goes for all other properties in the `base` configuration file.

_Note: The current Node runtime mode is always stored in `app.config.mode` and the user id in `app.config.user`._

# Routing

Routes are specified as a mapping in the `routes` module file in the following format:

```javascript
// file: <app folder>/src/routes.js

module.exports = {
  'GET /' : 'main.index',
  'PUT /newUser/:id': ['sanitizeValue', 'checkRequestBodySize', 'main.newUser'],
  ...
};
```

The key specifies the HTTP method (one of: `GET`, `POST`, `PUT`, `DEL`, `OPTIONS` and `HEAD`) and the route URL (relative to `app.config.baseURL`). Parameterized routing is supported thanks to [trie-router](https://github.com/koajs/trie-router).

The value for each key specifies the middleware chain that will handle that route. If the middleware name has a period (`.`) within it 
then it assumed to refer to a controller module file and a method name within. Otherwise it is assumed to be the name of a [middleware](#middleware) module file. 

For the above example, Waigo will process a `PUT` request made to `/newUser` in the following order:

1. `waigo.load('support/middleware/sanitizeValue')` and pass request to its exported method
2. `waigo.load('support/middleware/checkRequestBodySize')` and pass request to its exported method
3. `waigo.load('controllers/main')` and pass request to its `newUser` method

If you wish to initialise a particular middleware with options then you can specify it as an object. For example:

```javascript
// in routes.js

module.exports = {
  'POST /signup' : [ { id: 'bodyParser', limit: '1kb' }, 'main.signup' ]
  ...
};
```

In the above configuration the `bodyParser` middleware will get initialized with the request body size limit of `1KB`. Initialization takes place once, when the routes are first parsed and processed.

## Middleware

Waigo middleware works the same as Koa middleware. All middleware module files can be found under the `support/middleware` path. Additional middleware provided by your app and/or plugins should also sit under this path.

A middleware module file is expected to export a function which, when called, returns a generator function to add to the Koa middleware layer. For example:

```javascript
// file: <app folder>/src/support/middleware/example.js

module.exports = function() {
  return function*(next) {
    // do nothing and pass through
    yield next;
  };
};
```

During the middleware [startup](#startup) step the following middleware modules are initialised so that all incoming requests get processed by them:

* `errorHandler` - catch and handle all errors thrown during request processing
* `outputFormats` - setup the response [output format](#views-and-output-formats)
* `sessions` - create and retrieve the active client [session](#sessions)
* `staticResources` - handle requests made to static page resources, e.g. stylesheets, etc.


# Controllers

Controllers expose their route handling methods as generator functions. The default controller - `controllers/main` - simply has:

```javascript
// file: <waigo framework>/src/controllers/main.js

exports.index = function*(next) {
  yield this.render('index', {
    title: 'Hello world!'
  });
};
```

A controller must either call `this.render()` or pass control to the `next` middleware in the request chain.

# Database

The default Waigo configuration - `app.config.db` - creates a Mongo database connection using [mongoose](http://mongoosejs.com/). This connection (once established) is available through `app.db`. All supported database connection types are available in the `support/db` module file path. To add your own connection type add an appropriate module under that path.

# Models

In order to be as flexible as possible Waigo does not provide a model layer. Feel free to use an ORM, ODM, flat files or whatever type of model layer you want.

# Sessions

Sessions are created and loaded by the `sessions` middleware, which internally uses [koa-session-store](https://github.com/hiddentao/koa-session-store). The sessions middleware is automatically initialised as a [startup](#startup) step. 

You can access session data using `this.session`:

```javascript
// file: some controller

exports.index = function*(next) {
  yield this.render('index', {
    name: this.session.userName
  });
};
```

By default sessions are stored in a Mongo database (you can re-use the Mongoose [database](#database) connection) and cookies are issued to clients to keep track of sessions. The session configuration expects you to provide cookie signing keys for use by [Keygrip](https://github.com/jed/keygrip):

```javascript
// file: <waigo framework>/src/config/base.js

exports.session = {
  // cookie signing keys - these are used for signing cookies (using Keygrip) and should be set for your app
  keys: ['use', 'your', 'own'],
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

# Views and Output formats

As mentioned earlier on Waigo supports more than one response output format (e.g. HTML, JSON, etc) in order to make it easy to re-use your backend controllers for serving different types of front-ends.

Having different output formats makes it easy to re-use your route handlers (i.e. controllers) for dfferent types of front-ends. For example, you may wish to build a single-page web app or a mobile app which interacts with your back-end in a similar fashion to your normal web interface. Being able to re-use your controllers to output JSON makes life a easier in such cases.

The default output formats configuration is as follows:

```javascript
// file: <waigo framework>/src/config/base.js

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

As you can see, HTML and JSON output formats are supported by default, with the specific format chosen via a configurable URL query parameter. The actual implementations of each output format can be found in the `support/outputFormats` module file path. 

The `outputFormats` middleware sets up the output format for every request. It adds a `render()` method to the middleware context object (remember [seeing this earlier](#controllers)?). You use this as as follows:

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
{ 
  id: 123 
}
```

**Tip:** In order to make effective use of output formats, ensure all the data needed by your view templates is generated before you render the template. This will make it easier for you to switch between differnet output formats as and when needed without having to generate data separately for each different format.

## Custom formats

You can easily add your own custom output formats. For example, let's say you wanted to add an XML output format. You would first create an implementation for your output under the `support/outputFormats path:

```javascript
// file: <app folder>/src/outputFormats/xml.js

var xml_renderer = ...

exports.create = function(options) {
  var render = xml_renderer.init(options);    

  // 'render' should now equal a generator function which wil return the rendered output

  return {
    render: function*(view, locals) {
      this.body = yield render(view, _.extend({}, locals, this.app.locals));
      this.type = 'application/xml';
    }
  };
};
```

Once this is done and you can enable it by modifying the `outputFormats` middleware configuration. For example:

```javascript
// file: <app folder>/src/config/base.js

module.exports = waigo.load('config/base');

exports.outputFormats.formats.xml = {
  /* any XML renderer initialisation go here */
};
```

## View objects

When sending data back to the client we may want to first modify it, e.g. format dates, remove parts of the data that the client does not need to see in the given context, etc. Waigo introduces the concept of _view objects_ to support such functionality.

A view object is simply a plain Javascript object of key-value pairs which can be rendered. The `render()` method provided by the [output formats](#views-and-output-formats) middleware checks the passed-in template attributes to see if view objects can be generated for them. An object can generate a view object representation of itself if it implements the `HasViewObject` mixin (see `support/mixins.js`). Applying this mixin to 
a class requires you to implement a `toViewObject()` generator function for that class. This function takes a single argument - the context for the current request, allowing you to tailor the view object representation according to each individual request.

For example, let's say we have a model instance which holds data wish to send to the client:

```javascript
var waigo = require('waigo'),
  mixins = waigo.load('support/mixins');

var Model = function(name) {
  this.name = name;
  this.id = 234;
};
mixins.apply(Model, mixins.HasViewObject);

Model.prototype.toViewObject = function*(ctx) {
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

```javascript
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

Notice how the renderer didn't output the `id` attribute of our model instance. Also notice how the `stats` key-value pair was output 
just as it is. If a given attribute does not implement the `HasViewObject` mixin then it gets output as it is, unchanged.

If we now make the request with the `x-custom-key: test` header set then we will instead get:

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


All built-in [error](#errors) classes (including form [validation](#validation) errors) can generate view object representations of themselves. In fact, when the error handler sends an error response to the client it uses the view object representation of the error.


# Forms

Forms are treated as first-class citizens in Waigo. Each form used unique id; its configuration and input fields are specified in a file under the `forms/` path, the file name being the id of the form. 

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

The field `type` refers to the name of a module file under the `support/forms/fields/` path. So for the above form specification Waigo will expect the following paths to exist:

* `support/forms/fields/text`
* `support/forms/fields/password`

All field type classes inherit from the base `Field` class (found in `support/forms/field`). 

To create an instance of the above form you would do:

```javascript
var waigo = require('waigo'),
  Form = waigo.load('support/forms/form').Form;

var form = Form.new('signup');
```

Waigo will automatically look under the `forms/` file path to see if a form specification for the given id exists. It so it will load in this specification and return a `Form` instance.

## Form fields

When a form gets constructed it constructs and holds references to `Field` instances (see `support/forms/field`) depending on its field specification. 

A naive implementation would have each `Field` instance stores its current field value. The problem with this approach is that 
if we have, say, a 1000 clients all using the same form we would need a 1000 instances of each field in the form in order to store the data for each client separately. 

A better approach would be to store the data which differs from client to client in its own `Object` so that we can re-use `Field` instances across multiple `Form` instances. Waigo does this by storing all field values within a `state` property on the `Form` instance. The state can be get/set at any time and can also be passed in as a second parameter to the `Form` constructor:

```javascript
// save the form state
var form = Form.new('signup');
yield form.setValues( /* user input values */ );
this.session.formState = form.state;

...

// restore the form (and field values) to previous state
var form = Form.new('signup');
form.state = this.session.formState;

// we could also set the state during construction
var form = Form.new('signup', this.session.formState);
```

Let's say we wish to create another "signup" form for another client. We would again call `Form.new()`:

```javascript
var form2 = Form.new('signup');
```

`Form.new()` will internally check the `Form` instance cache to see if a `signup` form has already been created. If so it passes that to the `Form` constructor which then copies the references to its `Field` instances and any other common data:

```javascript
form2.fields === form.fields;   // true
form2.state === form.state;     // false 
```

## Sanitization

When setting form field values Waigo first sanitizes them. Sanitization is specified on a per-field basis in the form configuration. Let's trim all user input to our signup form: 

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

Each item in the `sanitizers` array refers to the name of a module file under the `support/forms/sanitizers/` path. So for the above form specification Waigo will expect the following path to exist:

* `support/forms/sanitizers/trim`

A sanitizer module exports a single function which should return a generator function (this performs the actual sanitization). For example, Waigo's built-in `trim` sanitizer looks like this:

```javascript
var validatorSanitizer = require('validator');

module.exports = function() {
  return function*(form, field, value) {
    return validatorSanitizer.trim(value);
  }
};

```

The actual sanitization function gets passed a `Form` and `Field` reference corresponding to the actual form and field it is operating on. This makes it possible to build complex sanitizers which can query other fields and the form itself. If sanitization fails then a `FieldSanitizationError` error gets thrown for the field for which it failed.

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

Once form field values have been set we can validate them by calling `Form.prototype.validate()`. Validation is specified on a per-field basis in the form configuration. Let's validate our signup form:

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

Each item in the `validators` array refers to the name of a module file under the `support/forms/validators/` path. When a validator (or even sanitizer) is specified as an `Object` then its `id` attribute is assumed to be its module file name. The `Object` itself is assumed to be a set of options to pass to the module during initialisation.

So for the above form specification Waigo will expect the following paths to exist:

* `support/forms/validators/notEmpty`
* `support/forms/validators/isLength`
* `support/forms/validators/matchesField`

A validator module exports a single function which should return a generator function (this performs the actual validation). For example, Waigo's built-in `isEmailAddress` validator looks like this:

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

The actual validation function gets passed a `Form` and `Field` reference corresponding to the actual form and field it is operating on. This makes it possible to build complex validators which can query other fields and the form itself.

When `Form.prototype.validate()` is called `Field.prototype.validate()` gets called for each field belonging to the form. For each field every validator gets run and all validation errors are grouped together within a single `FieldValidationError` instance. In `Form.prototype.validate()` all field validation errors are grouped together within a single `FormValidationError` instance. In this way validaton error reporting is very comprehensive and makes it easy to show the end-user exactly what failed to validate and why.

# Logging

Waigo provides support for [winston](https://github.com/flatiron/winston) by default. The default Winston logging target (see `config/base`) is a Mongo database. For `development` mode it's set to the console. All uncaught exceptions and `error` events emitted on the koa app object get logged in this way.

You may use any logging library you wish. The `app.config.logging` configuration object both specifies the name of a logger (to be loaded from the `support/logging` path) and configuration to pass to that logger.

# Errors

The `support/middleware/errorHandler` middleware is responsible for handling all errors which get thrown during the request handling process. Errors get logged through the default logger as well as getting sent back to the client which made the original request. 

It is highly recommended that your define and use your own error classes rather than use the built-in `Error` class. The `support/errors` module provides functionality to do this - your new error class will inherit from `RuntimeError` which in turn inherits from `Error`. `RuntimeError` allows you to set a HTTP status code along with the error message. This status code is used by the error handling middleware. For example:

```javascript
var waigo = require('waigo'),
  errors = waigo.load('support/errors');

// FileSystemError will inherit from errors.RuntimeError
var FileSystemError = errors.define('FileSystemError');

// FileReadError will inherit from FileSystemError
var FileReadError = errors.define('FileReadError', FileSystemError);

...

throw new FileReadError('Error reading image file', 500);
// resulting error will be instance of: FileReadError, FileSystemError and Error and a HTTP status code of 500 will be returned to the client.
```

_Note: Stack traces only get sent to the client if the `app.config.errorHandler.showStack` flag is turned on_


## Multiple errors

Another built-in error class is `MultipleError`. Sometimes we may wish to report multiple errors related to a particular operation. 
A `MultipleError` allows us to group `Error` instances together. When it gets sent to the client in an error response its own view object 
representation and that of its 'child errors' gets generated.

The [form and field validation errors](#validation) both derive from `MultipleError`, allowing Waigo to collect and report multiple validation failures back to the client in an elegant and efficient manner.

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

