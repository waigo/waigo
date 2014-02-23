[![Build Status](https://secure.travis-ci.org/hiddentao/waigo.png)](http://travis-ci.org/waigo/waigo) [![NPM module](https://badge.fury.io/js/waigo.png)](https://npmjs.org/package/waigo) [![Code quality](https://codeclimate.com/github/waigo/waigo.png)](https://codeclimate.com/github/waigo/waigo)

# What is Waigo?

Waigo is a flexible MVC framework for building scalable and maintainable web applications.

Based on [koa](http://koajs.com), it provides a cleaner mechanism for asynchronous programming, removing the 
need for callbacks. Plus almost every aspect of the core framework can be easily extended or overridden.

_Waigo (and koa underneath it) makes extensive use of [ES6 Generators](http://tobyho.com/2013/06/16/what-are-generators/). It is important that you understand how they work if you wish to dig into the source code._

# Getting started

## Installation

Waigo requires **Node.js v0.11.10 or above**. This along with the command-line `--harmony` flag will give us the ES6 features we need. An easy 
way to manage multiples versions of Node.js is to use [NVM](https://github.com/creationix/nvm).

Once Node is installed go ahead and install Waigo:

```bash
$ npm install waigo
```

## Hello world

We will use the [co](https://github.com/visionmedia/co) library to iterate through our generators:

```bash
$ npm install co
```

Create a new Javascript file (e.g. `app.js`) in your project folder with the following contents:

```javascript
var co = require('co'),
  waigo = require('waigo');

// Generator co-routine
co(function*() {
  // Initialise waigo module loading system
  yield* waigo.init();
  // Start the server
  yield* waigo.load('server').start();
})(function(err) {
  console.log(err);  
});
```

Finally, we need a [jade](http://jade-lang.com/) template:

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
HTML and JSON output, and more [output formats](#output-formats) can be easily added.

# Extend and Override

In the "Hello World" example above you will have noticed the following code:

```javascript
waigo.load('server')
```

When you want to use something from Waigo you first have to load its module file through `waigo.load()`. This allows you to:

1. Only load the parts of the framework you will actually use _(performance)_.
2. **Override any framework module file with your own version** _(extendability and customization)_.

When you want to load the `server` module file (as above) the loader will load in the following order of precedence:

1. `<your app folder>/src/server.js`
2. `<waigo npm module folder>/src/server.js`

_Note: if you have [plugins](#plugins) installed their paths will also be searched._

So if you provide a `server.js` within your app's folder tree then Waigo will use that instead of the default one provided by the framework. This rules applies to **every** module file within the Waigo framework. If you don't like something provided by Waigo you can easily override it.

But what if you specifically wanted the version of `server.js` provided by the framework? Just prefix `waigo:` to the module file name:

```javascript
// this will load the version of server.js provided by Waigo, and not the one provided by your app
waigo.load('waigo:server');   
```

This also means you don't have to completely override core functionality. You can also _extend_ it:

```javascript
// in file: <your app folder>/src/server.js

var waigo = require('waigo');

module.exports = waigo.load('waigo:server');    // load in Waigo framework version of server.js

exports.start = function*() {...}   // override start()
```

Going back to the small "Hello world" example we built above, there is another call we make:

```javascript
yield* waigo.init();
```

The logic which works out which module files are available and where they are located is actually within `waigo.init()`. This is the 
first call we must make to Waigo and we do it so that:

1. Subsequent calls to `waigo.load()` are fast _(since we already know what's available and where everything is)_.
2. We can catch any [plugin conflicts](#plugins) at startup _(rather than later on, when your app is already running)_.

_Note: This method takes an optional configuration parameter which tells it where to find the app's folder tree and the names of plugins to load, etc. See [API docs](http://waigojs.com/api.html) for more info._

## Plugins

You may wish to re-use functionality between different Waigo-based apps. In which case you can place the re-usable code into its own NPM module - this is essentially what a _plugin_ is. 

Let's say you have a plugin - `waigo-mongo` - which enables the use of MongoDB database connections. It may provide the following modules file:

`support/db/mongo.js`

To have Waigo load the plugin at startup simply `npm install` it and then add it to one of either `dependencies`, `devDependencies` or `peerDependencies` within your `package.json` file. When `waigo.init()` is called Waigo will automatically scan `package.json` to get all plugins (by default it considers anything prefixed with `waigo-` as a plugin). It will then scan each plugin's `src` folder 
tree for available module files and register them internally.

If you then call `waigo.load('support/db/mongo')` the system will load the module file from the plugin module's folder tree. If you were to create `support/db/mongo.js` within your app's folder tree then the app version would take precendence over the plugin version. Strictly speaking, precendence is given as follows: **App > Plugins > Waigo framework**.

What would happen if you had two plugins which both provided the same module file? in this case the call to `waigo.init()` would fail with 
an error which looks like the following:

```bash
Error: Module "support/db/mongo" has more than one plugin implementation to choose from: waigo-plugin1, waigo-plugin2, ...
```

In such instances if you don't want to remove one of the offending plugins then pick which plugin's implementation you want to use by providing a version of the module file within your app's folder tree. For example, if you wanted Waigo to use the implementation provided by `waigo-plugin1` then you would do:

```javascript
// in file: <your app folder>/src/support/db/mongo.js

var waigo = require('waigo');

// use the implementation from waigo-plugin1
module.exports = waigo.load('waigo-plugin1:support/db/mongo');    
```

_Note: See the `waigo-plugin1` prefix used in the call to `waigo.load()`? that basically tells the loader which module to load from._

To create and publish your own plugin to the wider community follow these guidelines:

* Ensure your plugin name is prefixed with `waigo-` so that it's easy to find.
* Write a good README.md for your plugin explaining what it's for and how to use it.
* Add tests for your plugin and hook them upto [Travis CI](https://travis-ci.org/).
* In your `package.json` tag your plugin with the `waigoplugin` keyword.

To see a list of all available plugins visit [https://www.npmjs.org/browse/keyword/waigoplugin](https://www.npmjs.org/browse/keyword/waigoplugin).

# Views

## Output formats

# Debugging

Waigo makes use of the excellent [debug](https://github.com/visionmedia/debug) utility throughout its internals. For instance, to debug the 
[loading system](#extend-and-override) run your app with the `DEBUG` environment variable as follows:

```javascript
$ DEBUG=waigo-loader node --harmony app.js
``` 


              //- ul.nav.waigo-docs-sidenav
              //-   li
              //-     a(href="#overview") Overview
              //-     ul.nav
              //-       li
              //-         a(href="#loader") Module loader
              //-   li
              //-     a(href="#gettingStarted") Getting Started
              //-     ul.nav
              //-       li
              //-         a(href="#installation") Installation
              //-       li
              //-         a(href="#helloWorld") Example: "Hello World"
              //-   li
              //-     a(href="#configuration") Configuration files
              //-   li
              //-     a(href="#startup") Startup logic
              //-   li
              //-     a(href="#middleware") Middleware
              //-   li
              //-     a(href="#routing") Routing
              //-   li
              //-     a(href="#controllers") Controllers
              //-   li
              //-     a(href="#views") Views
              //-     ul.nav
              //-       li
              //-         a(href="#outputFormats") Output formats
              //-   li
              //-     a(href="#models") Models
              //-   li
              //-     a(href="#customization") Customization
