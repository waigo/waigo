"use strict";


var debug = require('debug')('waigo-cli-init'),
  path = require('path'),
  util = require('util');

var waigo = require('../../'),
  AbstractCommand = waigo.load('support/cliCommand');
  

var dataFolder = path.join(__dirname, 'data', 'init');  


/**
 * The init CLI command.
 *
 * This command initialises a skeleton Waigo application with a basic view template.
 */
var Command = module.exports = function() {
  AbstractCommand.call(this, 
    'Initialise and create a skeleton Waigo app', []
  );
};
util.inherits(Command, AbstractCommand);



/**
 * Run this command.
 */
Command.prototype.run = function*() {
  yield this.installPkgs('waigo', 'co');
  yield this.copyFile(path.join(dataFolder, 'routes.js'), 'src/routes.js');
  yield this.copyFile(path.join(dataFolder, 'main.controller.js'), 'src/controllers/main.js');
  yield this.copyFile(path.join(dataFolder, 'index.jade'), 'src/views/index.jade');
  yield this.copyFile(path.join(dataFolder, 'start-app.js'), 'start-app.js');
};

