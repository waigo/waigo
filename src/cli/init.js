"use strict";


var debug require('debug')('waigo-cli-init'),
  fs = require('fs-then'),
  path = require('path'),
  util = require('util');

var waigo = require('../../'),
  AbstractCommand = waigo.load('support/cliCommand');
  


var Command = module.exports = AbstractCommand.define(
  'Initialise and create a skeleton Waigo app'
);

function(name, description) {
  AbstractCommand.call(this, module, );
};
util.inheritsFrom(Command, AbstractCommand);



Command.prototype.getOptions = function() {
  return [
    ['--app-folder [folder]', 'Relative path to application root folder (default: src)', 'src']
  ];
};



Command.prototype.run = function*() {
  // get current folder
  var currentFolder = process.cwd();
  debug(currentFolder);

  // do index.js
  var pathToIndexJs = path.join(currentFolder, 'index.js');
  if (! (yield fs.exists(pathToIndexJs)) ) {
    this.log('Creating index.js...');
  } else {
    this.log('Index.js already present.');
  }
};



/**
 * This command creates the barebones structure of a basic Waigo application, 
 * enough to run your application.
 *
 * It generates the following:
 *
 * * `index.js` - the application entry point
 * * `src/` - the application source folder
 * * `src/views/index.jade` - a default 'Hello World' view template for the built-in default controller.
 */
module.exports = {
  description: 'Initialise and create a skeleton Waigo app',

  options: [
    ['--app-folder [folder]', 'Relative path to application root folder (default: src)', 'src']
  ],

  run: function*() {
    // get current folder
    var currentFolder = process.cwd();
    debug(currentFolder);

    // do index.js
    var pathToIndexJs = path.join(currentFolder, 'index.js');
    if (! (yield fs.exists(pathToIndexJs)) ) {
      console.log('need to create');
    } else {
      debug('index.js found ')
    }
  }
};
