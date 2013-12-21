var _ = require('lodash'),
  path = require('path'),
  fs = require('fs');

// if Waigo global object hasn't yet been setup then do so
if (!GLOBAL.waigo) {
  var _log = function(msg) {
    console.log('[waigo] ' + msg);
  };


  var waigo = GLOBAL.waigo = {};


  var processScript = process.argv[1],
    libFolder = path.join(__dirname, 'src'),
    appFolder = path.join(path.dirname(processScript), 'src'),
    loaderLogging = false;


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
    _log('Set app folder to: ' + absolutePath);
    appFolder = absolutePath;
  };



  /**
   * Toggle waigo loader logging.
   * @param toggle {Boolean} true to enable, false to disable.
   */
  waigo.showLoaderLog = function(toggle) {
    _log('Loader logging toggle: ' + toggle);
    loaderLogging = toggle;
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
   * @param moduleName {string} module name in format: path.subpath.subpath2.moduleName. If prefixed with "lib:" then
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

    var relativePath = path.join.apply(path, moduleName.split('.'));
    relativePath[relativePath.length - 1];

    if (!wantLibOnly) {
      var appFolderPath = path.join.apply(path, [appFolder].concat(relativePath));

      if (fs.existsSync(appFolderPath + '.js')) {
        if (loaderLogging) {
          _log('Loading module "' + moduleName + '" from APP (' + appFolderPath + ')');
        }
        return require(appFolderPath);
      } else if (options.failIfNotInAppTree) {
        throw new Error('Unable to find module in app folder tree: ' + moduleName);
      }
    }

    var libFolderPath = path.join.apply(path, [libFolder].concat(relativePath));

    if (loaderLogging) {
      _log('Loading module "' + moduleName + '" from LIB (' + libFolderPath + ')');
    }
    return require(libFolderPath);
  };
}


module.exports = GLOBAL.waigo;
