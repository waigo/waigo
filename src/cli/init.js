"use strict";


var debug = require('debug')('waigo-cli-init'),
  path = require('path'),
  util = require('util');

var waigo = require('../../'),
  AbstractCommand = waigo.load('support/cliCommand');
  

var dataFolder = path.join(__dirname, 'data', 'init');  


/**
 * @constructor
 */
var Command = module.exports = function() {
  AbstractCommand.call(this, 
    'Initialise and create a skeleton Waigo app', []
  );
};
util.inherits(Command, AbstractCommand);



/**
 * @override
 */
Command.prototype.run = function*() {
  var currentFolder = this._getProjectFolder();

  yield this.installPkgs('waigo', 'co');
  yield this.copyFile(path.join(dataFolder, 'start-app.js'), 'start-app.js');
  yield this.copyFile(path.join(dataFolder, 'index.jade'), 'src/views/index.jade');
};

