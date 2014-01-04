var _ = require('lodash'),
  debug = require('debug')('waigo-loader'),
  path = require('path'),
  fs = require('fs');

var waigo = null;

// Node.js caches loaded modules - so we know this code will only get executed once.
if (!waigo) {
  waigo = {};


  var processScript = process.argv[1],
    libFolder = path.join(__dirname, 'src'),
    appFolder = path.join(path.dirname(processScript), 'src');


  /**
   * Get absolute path to folder containing application files.
   * @return {string}
   */
  waigo.getAppFolder = function() {
    return appFolder;
  };


  /**
   * Set absolute path to folder containing application files.
   * @param absolutePath {string} absolute path to folder.
   */
  waigo.setAppFolder = function(absolutePath) {
    debug('Set app folder to: ' + absolutePath);
    appFolder = absolutePath;
  };



  /**
   * Load a Waigo module.
   *
   * We check for the module in the following locations in order
   * - {app folder}/(module path}
   * - {lib folder}/{module path}
   *
   * Thus we allow the app to completely override any of Waigo's built-in modules.
   *
   * @param moduleName {string} module name in format: path/subpath/subsubpath/moduleName. If prefixed with "lib:" then
   * only the Waigo lib folder will be checked, meaning that the overriden version under the app folder tree won't be
   * loaded.
   *
   * @param [options] {Object} additional options.
   * @param [options.failIfNotInAppTree] {Boolean} if true then an exception will be thrown if the module cannot be found
   * within the app folder tree. Default is false.
   *
   * @return {*} contents of loaded module
   *
   * @throws Error if there was an error loading the module.
   */
  waigo.load = function(moduleName, options) {
    options = _.extend({
      appMustExist: false
    }, options);

    var wantLibOnly = (0 === moduleName.toLowerCase().indexOf('lib:'));
    if (wantLibOnly) {
      moduleName = moduleName.substr(4);  // remove 'lib:' prefix
    }

    var relativePath = path.join.apply(path, moduleName.split('/'));
    relativePath[relativePath.length - 1];

    if (!wantLibOnly) {
      var appFolderPath = path.join.apply(path, [appFolder].concat(relativePath));

      if (fs.existsSync(appFolderPath + '.js')) {
        debug('Loading module "' + moduleName + '" from APP (' + appFolderPath + ')');
        return require(appFolderPath);
      } else if (options.failIfNotInAppTree) {
        throw new Error('Unable to find module in app folder tree: ' + moduleName);
      }
    }

    var libFolderPath = path.join.apply(path, [libFolder].concat(relativePath));

    debug('Loading module "' + moduleName + '" from LIB (' + libFolderPath + ')');
    return require(libFolderPath);
  };
}


module.exports = waigo;
