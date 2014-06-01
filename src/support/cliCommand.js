"use strict";


var fs = require('fs-then'),
  path = require('path');

var waigo = require('../../');


/**
 * Abstract base class for CLI commands.
 * 
 * @param  {String} name        Name to invoke the command (no spaces allowed).
 * @param  {String} description Description of what it does.
 */
var AbstractCommand = module.exports = function(name, description) {
  this.name = name;
  this.description = description;
};




/** 
 * Get options for this command.
 *
 * Each item in returned list of options should be an Array of parameters that 
 * get passed to [Commander.option](http://visionmedia.github.io/commander.js/#Command.prototype.option).
 * 
 * @return {Array} List of options.
 */
AbstractCommand.prototype.getOptions = function() {
  return [];
};  



/** 
 * Run this command.
 *
 * This function gets passed to [Commander.action](http://visionmedia.github.io/commander.js/#Command.prototype.action) 
 * as the command handler.
 */
AbstractCommand.prototype.run = function*() {
  throw new Error('Not yet implemented');
};  





/** 
 * Show the user a message.
 *
 * @param {String} msg The log message to write.
 */
AbstractCommand.prototype.log = function(msg) {
  console.log('cli[' + this.name + ']: ' + msg);
};  


