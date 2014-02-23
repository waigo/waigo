# What is Waigo?

Waigo is a flexible MVC framework for building scalable and maintainable web applications.

Based on [koa](http://koajs.com), it uses Javascript ES6 features to provide a cleaner mechanism for asynchronous programming, removing the 
need for callbacks. It is architected such that any aspect of the core framework functionality can easily be extended or overridden.

_Waigo (and koa underneath it) makes extensive use of [ES6 Generators](http://tobyho.com/2013/06/16/what-are-generators/). It is important you understand how they work if you wish to understand parts of this guide and/or wish to dig into the source code._

# Getting started

Before we go into further details about what Waigo does and what it offers let's get a simple website up and running.

## Installation

Waigo requires **Node.js v0.11.10 or above**. This along with the command-line `--harmony` flag will give us the ES6 features we need. An easy 
way to manage multiples versions of Node.js is to use [NVM](https://github.com/creationix/nvm).

Install from NPM:

```shell
$ npm install waigo
```

## "Hello world"

In this example we will be using the [co](https://github.com/visionmedia/co) library to iterate through our generators. We need to install it:

```shell
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

Let's create our homepage template:

```shell
$ mkdir -p src/views
$ echo "{{title}}" > src/views/index.jade
```

Start the app:

```shell
$ node --harmony app.js
```

Visit [http://localhost:3000](http://localhost:3000) and you should see the text _Hello world!_.





# Extend and override

The core driving philosophy behind Waigo is: **Do It The Way You Want ("ditty")**. 

Waigo differs from most other frameworks in that it allows you to extend/override core functionality to your liking. At the heart of Waigo is 
its module loading system.



Waigo offers you tools and a structure for your web app but you can extend and/or override any aspect of the core functionality you are 
dissatisifed with.

Waigo offers plenty of functionality out of the box to help you but at the same times allows you to override aspects of its functionality to your liking.


At its heart Waigo 

Almost every bit of functionality within the Waigo core framework can be overridden. 

Every module within 


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
              //-     ul.nav
              //-       li
              //-         a(href="#overriding") Extend and override
              //-       li
              //-         a(href="#plugins") Plugins
