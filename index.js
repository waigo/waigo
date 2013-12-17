var _ = require('lodash'),
  path = require('path'),
  fs = require('fs');

// if Waigo global object hasn't yet been setup then do so
if (!GLOBAL.waigo) {
  // handle all uncaught exceptions from here on in
  process.on('uncaughtException', function(err) {
    console.log('Uncaught exception', err, err.stack);
  });

  var _log = function(msg) {
    console.log('[waigo] ' + msg);
  };

  var waigo = GLOBAL.waigo = {
    processFolder : process.cwd()
  };

  var pathToCustomConfig = path.join(waigo.processFolder, 'waigo.js'),
    pathToDefaultConfig = path.join(__dirname, 'waigo.js');

  // load config: default first, then overridden by custom config
  var config = require(pathToDefaultConfig);
  if (fs.existsSync(pathToCustomConfig)) {
    _log('Loading custom config: ' + pathToCustomConfig);
    _.extend(config, require(pathToCustomConfig));
  }

  // fully resolve app src folder
  waigo.appFolder = path.join(waigo.processFolder, config.src);

  // fully resolve waigo lib folder
  waigo.libFolder = path.join(__dirname, 'src');


  /**
   * Load a Waigo module.
   *
   * We check for the module in the following locations in order
   * - {app folder}/(module path}
   * - {lib folder}/{module path}
   *
   * Thus we allow the app to completely override any of Waigo's built-in modules.
   *
   * @param moduleName {string} module name in format: path.subpath.subpath2.moduleName. If prefixed with "lib:" then
   * only the Waigo lib folder will be checked, meaning that the overriden version under the app folder tree won't be
   * loaded.
   *
   * @return {*} contents of loaded module
   *
   * @throws Error if there was an error loading the module.
   */
  waigo.load = function(moduleName) {
    var relativePath = path.join.apply(path, moduleName.split('.'));
    relativePath[relativePath.length - 1] += '.js';

    if (0 !== moduleName.toLowerCase().indexOf('lib:')) {
      var appFolderPath = path.join.apply(path, [waigo.appFolder].concat(relativePath));

      if (fs.existsSync(appFolderPath)) {
        var mod = require(appFolderPath);
        if (config.logLoader) {
          _log('Loaded app module: ' + moduleName);
        }
        return mod;
      }
    }

    var libFolderPath = path.join.apply(path, [waigo.libFolder].concat(relativePath));

    var mod =require(libFolderPath);
    if (config.logLoader) {
      _log('Loaded lib module: ' + moduleName);
    }
    return mod;
  };
}


module.exports = GLOBAL.waigo;
