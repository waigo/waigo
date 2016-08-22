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
      return this.log('Please run "npm init" first');
    }

    yield this.installPkgs([
      'waigo',
      'semver',
    ]);

    yield this.copyFile(path.join(DATA_FOLDER, 'README.md'), 'src/README.md');
    yield this.copyFile(path.join(DATA_FOLDER, '_gitignore'), '.gitignore');
    yield this.copyFile(path.join(FRAMEWORK_FOLDER, 'start-app.js'), 'start-app.js');
    yield this.copyFile(path.join(WAIGO_FOLDER, 'config', 'base.js'), 'src/config/base.js');
  }
}



module.exports = Command;
