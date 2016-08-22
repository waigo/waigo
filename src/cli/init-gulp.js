"use strict";

const path = require('path'),
  util = require('util');

const waigo = global.waigo,
  _ = waigo._,
  AbstractCommand = waigo.load('support/cliCommand');
  
const WAIGO_FOLDER = waigo.getWaigoFolder(),
  FRAMEWORK_FOLDER = path.join(WAIGO_FOLDER, '..');

const DATA_FOLDER = path.join(__dirname, 'data', 'init');  


/**
 * This command initialises a skeleton Gulpfile with associated tasks.
 */
class Command extends AbstractCommand {
  constructor() {
    super('Initialise and create a Gulpfile and associated tasks for development purposes', []);
  }

  /**
   * Run this command.
   */
  * run () {
    if (!this.fileExists('package.json')) {
      return this.log('Please run "npm init" first');
    }

    yield this.installPkgs([
      'lodash',
      'coffee-script',
      'gulp@3.9.x',
      'gulp-server-livereload',
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
      'watchify',
      'browserify',
      'vinyl-source-stream2',
      'yargs',
    ], {
      dev: true,
    });
    
    yield this.copyFile(path.join(FRAMEWORK_FOLDER, 'gulpfile.coffee'), 'gulpfile.coffee');
    yield this.copyFolder(path.join(FRAMEWORK_FOLDER, 'gulp', 'utils'), 'gulp/utils');
    yield _.map([
      'dev-frontend',
      'dev-server',
      'dev',
      'frontend-css',
      'frontend-img',
      'frontend-js',
      'frontend',
    ], (n) => {
      return this.copyFile(path.join(FRAMEWORK_FOLDER, 'gulp', `${n}.coffee`), `gulp/${n}.coffee`);
    });
  }
}



module.exports = Command;

