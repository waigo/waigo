"use strict";


var debug = require('debug')('waigo-cli-init'),
  path = require('path'),
  util = require('util');

var waigo = require('../../'),
  AbstractCommand = waigo.load('support/cliCommand');
  
var waigoFolder = waigo.getWaigoFolder();

var dataFolder = path.join(__dirname, 'data', 'init');  


/**
 * The init CLI command.
 *
 * This command initialises a skeleton Waigo application with a basic view template.
 */
var Command = module.exports = function() {
  AbstractCommand.call(this, 
    'Initialise and create a skeleton Waigo app and build tools', []
  );
};
util.inherits(Command, AbstractCommand);


/**
 * Run this command.
 */
Command.prototype.run = function*() {
  yield this.installPkgs(['waigo']);

  yield this.installPkgs([
    'semver',
    'coffee-script',
    'gulp@3.8.x',
    'gulp-if@1.2.x',
    'gulp-autoprefixer@2.1.x',
    'gulp-minify-css@0.4.x',
    'gulp-concat@2.4.x',
    'gulp-stylus@2.0.x',
    'nib',
    'rupture',
    'gulp-uglify@1.1.x',
    'gulp-util@3.0.x',
    'gulp-nodemon@1.0.x',
    'yargs'
  ], {
    dev: true,
  });
  
  yield this.copyFile(path.join(dataFolder, 'README.md'), 'src/README.md');
  yield this.copyFile(path.join(dataFolder, '_gitignore'), '.gitignore');

  yield this.copyFile(path.join(waigoFolder, '..', 'start-app.js'), 'start-app.js');
  yield this.copyFile(path.join(waigoFolder, '..', 'gulpfile.coffee'), 'gulpfile.coffee');
  yield this.copyFolder(path.join(waigoFolder, '..', 'gulp'), '.');

  yield this.copyFile(path.join(waigoFolder, 'config', 'base.js'), 'src/config/base.js');
};

