/**
 * The actual Waigo command-line interface
 *
 * This uses ES6 which is why we call it from the `waigo` 
 * executable after having enabled Harmony in the VM.
 */

"use strict";

const _ = require('lodash'),
  co = require('co'),
  commander = require('commander'),
  debug = require('debug')('waigo-cli'),
  path = require('path'),
  shell = require('shelljs');


const frameworkFolderPath = path.join(__dirname, '..'),
  waigo = require(frameworkFolderPath);



let _handleError = function(err) {
  console.error(err.stack);

  process.exit(-1);
};


co(function*() {
  // app folder available?
  let appFolderPath = path.join(process.cwd(), 'src');
  if (!shell.test('-d', appFolderPath)) {
    // if not then use the framework folder
    appFolderPath = path.join(frameworkFolderPath, 'src');
  }

  debug(`App folder: ${appFolderPath}`);

  // init
  yield waigo.init({
    appFolder: appFolderPath
  });

  debug('Waigo initialised');

  // load all commands
  let commands = waigo.getItemsInFolder('cli');

  // initialise parser
  let program = commander;

  // version
  let packageJson = require(path.join(waigo.getWaigoFolder(), '..', 'package.json'));
  program.version(packageJson.version);

  // commands
  _.each(commands, function(command) {
    debug(`Found command: ${command}`);

    let commandName = path.basename(command);

    let CommandClass = waigo.load(command);

    let obj = new CommandClass;

    let cmd = program
      .command(commandName)
      .description(obj.description)
      .action(
        function() {
          co(function*() {
            yield obj.run.apply(obj, arguments);
          })
            .catch(_handleError);
        }
      );

    _.each(obj.options, function(o) {
      cmd.option.apply(cmd, o);
    });
  }); 

  // parse and dispatch
  debug('Executing command');

  program.parse(process.argv);
})
  .catch(_handleError);
