"use strict";

const debug = require('debug')('waigo-cli-init'),
  path = require('path'),
  util = require('util');

const waigo = global.waigo,
  _ = waigo._,
  AbstractCommand = waigo.load('support/cliCommand');
  
const WAIGO_FOLDER = waigo.getWaigoFolder(),
  FRAMEWORK_FOLDER = path.join(WAIGO_FOLDER, '..');

const DATA_FOLDER = path.join(__dirname, 'data', 'init');  


/**
 * The init CLI command.
 *
 * This command initialises a skeleton Waigo application with a basic view template.
 */
class Command extends AbstractCommand {
  constructor() {
    super('Initialise and create a skeleton Waigo app', []);
  }

  /**
   * Run this command.
   */
  * run () {
    if (!this.fileExists('package.json')) {
      throw new Error('Please run "npm init" first');
    }

    yield this.installPkgs([
      'waigo',
      'semver',
    ]);

    yield this.installPkgs([
      'lodash',
      'coffee-script',
      'gulp@3.9.x',
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
      'run-sequence',
      'yargs',
    ], {
      dev: true,
    });
    
    yield this.copyFile(path.join(DATA_FOLDER, 'README.md'), 'src/README.md');
    yield this.copyFile(path.join(DATA_FOLDER, '_gitignore'), '.gitignore');

    yield this.copyFile(path.join(FRAMEWORK_FOLDER, 'start-app.js'), 'start-app.js');
    
    yield this.copyFile(path.join(WAIGO_FOLDER, 'config', 'base.js'), 'src/config/base.js');
  }
}



module.exports = Command;

