var _ = require('lodash'),
  debug = require('debug')('waigo-loader'),
  findup = require('findup-sync'),
  path = require('path'),
  Promise = require('bluebird'),
  fs = require('fs'),
  globule = require('globule'),
  walk = require('findit');

// Node.js caches loaded modules - so we know this code will only get executed once.



var waigoFolder = path.join(__dirname, 'src'),
  appFolder = path.join(process.cwd(), 'src'),
  waigo = {};


/** Internal module loading configuration. Do not access or manipulate this yourself. This is exposed purely for testing purposes. */  
waigo.__modules = null;




/**
 * Walk given folder hierarchy and return all `.js` files.
 * @return {Promise}
 */
var _walk = function(folder) {
  return new Promise(function(resolve, reject) {
    var files = {};

    var walker = walk(folder, {
      followSymlinks: false
    });

    walker.on('file', function(file, stat) {
      var extName = path.extname(file);
      if ('.js' !== extName) return;

      // /x/y/z/abc.js -> /x/y/z/abc
      var dirname = path.dirname(file),
        baseName = path.basename(file, extName),
        moduleName = path.join(path.relative(folder, dirname), baseName);

      files[moduleName] = path.join(dirname, baseName);
    });  

    walker.on('end', function() {
      resolve(files);
    });  
  });
};



/**
 * Get absolute path to folder containing application files.
 * @return {string}
 */
waigo.getAppFolder = function() {
  return appFolder;
};




/**
 * Initialise Waigo.
 *
 * This loads available plugins and ensures that there are no instances of any given module being provided by two or 
 * more plugins. For more information on how Waigo decides where to load modules from see the `load()` method docs.
 * 
 * If `options.plugins` is provided then those named plugins get loaded. If not then the remaining options are used to 
 * first work out which plugins to load and then those plugins get loaded. By default the plugin names to load are 
 * filtered from the dependencies listed within the `package.json` file.
 *
 * @param [options] {Object} loading configuration.
 * @param [options.appFolder] {String} absolute path to folder containing app files. Overrides the default calculated folder.
 * @param [options.plugins] {Object} plugin loading configuration.
 * @param [options.plugins.names] {Array} plugins to load. If omitted then other options are used to load plugins.
 * @param [options.plugins.glob] {Array} Regexes specifying plugin naming conventions. Default is `waigo-*`.
 * @param [options.plugins.config] {String} JSON config containing names of plugins to load. Default is to load `package.json`.
 * @param [options.plugins.configKey] {Array} Names of keys in JSON config whose values contain names of plugins.
 */
waigo.init = function*(options) {
  if (waigo.__modules) {
    throw new Error('Waigo already inititialised');
  }

  options = options || {};
  options.plugins = options.plugins || {};

  appFolder = options.appFolder || appFolder;

  // get loadable plugin
  if (!options.plugins.names) {
    debug('Getting plugin names...');
    
    // based on code from https://github.com/sindresorhus/load-grunt-tasks/blob/master/load-grunt-tasks.js
    var pattern = options.plugins.glob || ['waigo-*'];
    var config = options.plugins.config || findup('package.json');
    var scope = options.plugins.configKey || ['dependencies', 'devDependencies', 'peerDependencies'];

    var names = scope.reduce(function (result, prop) {
      return result.concat(Object.keys(config[prop] || {}));
    }, []);

    options.plugins.names = _.uniq(globule.match(pattern, names));
  }
  
  debug('Plugins to load: ' + options.plugins.names.join(', '));

  // scan all folder trees and build up the available modules...
  waigo.__modules = {};

  var sourcePaths = {
    waigo: waigoFolder,
    app: appFolder
  };

  _.each(options.plugins.names, function(name) {
    sourcePaths[name] = path.join( require.resolve(name), 'src' );
  });

  var scanOrder = ['waigo'].concat(options.plugins.names, 'app');

  for (var i = 0; i < scanOrder.length; ++i) {
    var sourceName = scanOrder[i],
      moduleMap = yield _walk(sourcePaths[sourceName]);

    _.each(moduleMap, function(modulePath, moduleName) {
      waigo.__modules[moduleName] = waigo.__modules[moduleName] || { 
        sources: {} 
      };
      waigo.__modules[moduleName].sources[sourceName] = modulePath;
    });
  }

  // now go through the list of available modules and ensure that there are no ambiguities
  _.each(waigo.__modules, function(moduleConfig, moduleName) {
    var sourceNames = Object.keys(moduleConfig.sources);

    // if there is an app implementation then that's the one to use
    if (sourceNames.app) {
      moduleConfig._load = 'app';
    } 
    // if there is only one source then use that one
    else if (1 === sourceNames.length) {
      moduleConfig._load = sourceNames[0];
    }
    // else
    else {
      // get plugin source names
      var pluginSources = _.filter(sourceNames, function(srcName) {
        return 'waigo' !== srcName;
      });

      // if more than one plugin then we have a problem
      if (1 < pluginSources.length) {
        throw new Error('Module "' + name + '" has more than plugin implementation to choose from: ' + pluginSources.join(', '));
      } 
      // else the one available plugin is the source
      else {
        moduleConfig._load = pluginSources[0];
      }
    }

    debug('Module "' + moduleName + '" will be loaded from source "' + moduleConfig._load + '"');
  });
};







/**
 * Load a Waigo module.
 *
 * Module names to load are specified in the form:  [module_name:]<module_path>
 *
 * If `module_name:` is not given then Waigo works out the which version of the module to load based on the 
 * following priority order:  app folder tree, plugins folder tree, core waigo framework folder tree
 *
 * Thus an app can completely override any of the framework's built-in files.
 *
 * If a call to load the `support/errors` module is made Waigo checks the following paths in order until a 
 * file is found:
 *
 * `<app folder>/support/errors.js`
 * `<waigo plugin 1>/src/support/errors.js`
 * `<waigo plugin 2>/src/support/errors.js`
 * `<waigo plugin ...>/src/support/errors.js`
 * `<waigo plugin N>/src/support/errors.js`
 * `<waigo module>/src/support/errors.js`
 *
 * If the caller wishes to load the version of the module provided by the `waigo-doc` plugin then the module name 
 * should be specified as `waigo-doc:support/errors`. If on the other hand they wish to load the version provided the 
 * core Waigo framework then `waigo:support/errors` should be used.
 *
 * @param moduleName {string} module name in supported format. See the docs for this function for more information.
 *
 * @return {Object} contents of loaded module.
 *
 * @throws Error if there was an error loading the module.
 */
waigo.load = function(moduleName) {
  if (!waigo.__modules) {
    throw new Error('Please initialise Waigo first');
  }

  // get source to load from
  var sanitizedModuleName = moduleName,
    source = 'app';

  var sepPos = moduleName.indexOf(':')
  if (-1 < sepPos) {
    source = moduleName.substr(0, sepPos);
    sanitizedModuleName = moduleName.substr(sepPos + 1);
  }

  debug('Loading module "' + sanitizedModuleName + '" from source "' + sourceName + '"');
  return require(waigo.__modules[sanitizedModuleName].sources[source]);
};




module.exports = waigo;
