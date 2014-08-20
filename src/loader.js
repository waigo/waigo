"use strict";


// dependencies
var _ = require('lodash'),
  debug = require('debug')('waigo-loader'),
  findup = require('findup-sync'),
  path = require('path'),
  Q = require('bluebird'),
  fs = require('fs'),
  globule = require('globule'),
  walk = require('findit');


// some stuff
var waigoFolder = path.join(__dirname),
  appFolder = path.join(path.dirname(require.main.filename), 'src'),
  loader = {};




/**
 * Get reference to `lodash` extended with `underscore.string` module and Waigo's enhanced mixins (see `support/underscore.js`).
 */
loader._ = _;


/** 
 * Internal module loading configuration. Do not access or manipulate this yourself. This is exposed purely for testing purposes.
 * @private
 */
loader.__modules = null;



/**
 * Walk given folder and its subfolders and return all `.js` files.
 *
 * @param {Object} [options] Additional options.
 * @param {Array} [options.excludeFolders] Sub-folders to exclude in the search, relative to the root folder.
 * 
 * @return {Promise}
 * @private
 */
var _walk = function(folder, options) {
  options = _.extend({
    excludeFolders: []
  }, options);

  return new Q(function(resolve, reject) {
    var files = {};

    var walker = walk(folder, {
      followSymlinks: false
    });

    walker.on('directory', function (dir, stat, stop) {
      // remove root folder path and trailing slash to get subpath, e.g. config
      var subPath = dir.substr(folder.length + 1);

      // skip excluded folders
      if (0 <= _.indexOf(options.excludeFolders, subPath)) {
        stop();
      }
    });

    walker.on('file', function(file, stat) {
      var extName = path.extname(file);
      if ('.js' !== extName) {
        return;
      }

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
 * Initialise the Waigo module file loader.
 *
 * This scans the folder trees of the core framework, plugins and your
 * application to map out what's available and to ensure that there are no
 * instances of any given module file being provided by two or more plugins.
 * For more information on how Waigo decides where to load modules from see
 * the `load()` method.
 *
 * If `options.plugins` is provided then those named plugins get loaded. If
 * not then the remaining options are used to first work out which plugins to
 * load and then those plugins get loaded. By default the plugins to load are
 * filtered from the dependencies listed within the `package.json` file.
 * 
 * @param {Object} [options] Loading configuration.
 * @param {String} [options.appFolder] Absolute path to folder containing app files. Overrides the default calculated folder.
 * @param {Object} [options.plugins] Plugin loading configuration.
 * @param {Array} [options.plugins.names] Plugins to load. If omitted then other options are used to load plugins.
 * @param {Array} [options.plugins.glob] Regexes specifying plugin naming conventions. Default is `waigo-*`.
 * @param {String|Object} [options.plugins.config] JSON config containing names of plugins to load. If a string is given then it assumed to be the path of a Javasript file. Default is to load `package.json`.
 * @param {Array} [options.plugins.configKey] Names of keys in JSON config whose values contain names of plugins. Default is `dependencies, devDependencies, peerDependencies`.
 */
loader.init = function*(options) {
  if (loader.__modules) {
    debug('Waigo already initialised. Re-initialising...');
  }

  options = options || {};
  options.plugins = options.plugins || {};

  appFolder = options.appFolder || appFolder;

  // get loadable plugin
  if (!options.plugins.names) {
    debug('Getting plugin names...');
    
    // based on code from https://github.com/sindresorhus/load-grunt-tasks/blob/master/load-grunt-tasks.js
    var pattern = options.plugins.glob || ['waigo-*'];
    var config = options.plugins.config || 'package.json';
    var scope = options.plugins.configKey || ['dependencies', 'devDependencies', 'peerDependencies'];
    
    if ('string' === typeof config) {
      if ('package.json' === config) {
        var pathToPackageJson = findup('package.json', {
          cwd: appFolder
        });

        if (pathToPackageJson) {
          config = require(pathToPackageJson);
        } else {
          debug('Unable to find package.json.');
          config = {};
        } 
      } else {
        config = require(path.resolve(config));        
      }
    }

    var names = scope.reduce(function (result, prop) {
      return result.concat(Object.keys(config[prop] || {}));
    }, []);

    options.plugins.names = 
      _.without(_.uniq(globule.match(pattern, names)), 'waigo-test-utils');
  }
  
  debug('Plugins to load: ' + options.plugins.names.join(', '));

  // scan all folder trees and build up the available modules...
  loader.__modules = {};

  var sourcePaths = {
    waigo: waigoFolder,
    app: appFolder
  };

  _.each(options.plugins.names, function(name) {
    sourcePaths[name] = path.join( path.dirname(require.resolve(name)), 'src' );
  });

  var scanOrder = ['waigo'].concat(options.plugins.names, 'app');

  for (var i = 0; i < scanOrder.length; ++i) {
    var sourceName = scanOrder[i],
      moduleMap = yield _walk(sourcePaths[sourceName], {
        excludeFolders: [
          'cli/data',
          'views'
        ]
      });

    /*jshint -W083 */
    _.each(moduleMap, function(modulePath, moduleName) {
      loader.__modules[moduleName] = loader.__modules[moduleName] || { 
        sources: {} 
      };
      loader.__modules[moduleName].sources[sourceName] = modulePath;
    });
  }

  // now go through the list of available modules and ensure that there are no ambiguities
  _.each(loader.__modules, function(moduleConfig, moduleName) {
    var sourceNames = Object.keys(moduleConfig.sources);

    // if there is an app implementation then that's the one to use
    if (moduleConfig.sources.app) {
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
        throw new Error('Module "' + moduleName + '" has more than one plugin implementation to choose from: ' + pluginSources.join(', '));
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
 * Load a Waigo module file.
 *
 * Names to load are specified in the form: `[npm_module_name:]<module_file_path>`
 *
 * If `npm_module_name:` is not given then Waigo works out the which version
 * of the module file to load according to the following priority order: **App >
 * plugins > core framework**.
 *
 * Thus an app can completely override any of the framework's built-in module
 * files.
 *
 * For example, when a call to load the `support/errors` module is made Waigo
 * checks the following paths in order until a match is found:
 *
 * * `<app folder>/support/errors.js`
 * * `<waigo plugin 1>/src/support/errors.js`
 * * `<waigo plugin 2>/src/support/errors.js`
 * * `<waigo plugin...>/src/support/errors.js`
 * * `<waigo plugin N>/src/support/errors.js`
 * * `<waigo module>/src/support/errors.js`
 *
 * In the above example, if the caller wishes to explicitly load the version
 * provided by the `waigo-doc` plugin then the parameter should be
 * `waigo-doc:support/errors`. If on the other hand they wish to load the
 * version provided the core Waigo framework then `waigo:support/errors`
 * should be used.
 * 
 * @param {string} moduleFileName Module file name in the supported format (see above).
 * @return {Object} contents of loaded module.
 * @throws Error if there was an error loading the module.
 */
loader.load = function(moduleName) {
  if (!loader.__modules) {
    throw new Error('Please initialise Waigo first');
  }

  // get source to load from
  var sanitizedModuleName = moduleName,
    source = null;

  var sepPos = moduleName.indexOf(':')
  if (-1 < sepPos) {
    source = moduleName.substr(0, sepPos);
    sanitizedModuleName = moduleName.substr(sepPos + 1);
  }

  if (!loader.__modules[sanitizedModuleName]) {
    throw new Error('Module not found: ' + sanitizedModuleName);
  }

  // if no source then use default
  if (!source) {
    source = loader.__modules[sanitizedModuleName]._load;
  }

  if (!loader.__modules[sanitizedModuleName].sources[source]) {
    throw new Error('Module source not found: ' + source);
  }

  debug('Loading module "' + sanitizedModuleName + '" from source "' + source + '"');

  return require(loader.__modules[sanitizedModuleName].sources[source]);
};




/**
 * Get names of all Waigo module files under a particular path.
 *
 * This will look through the initialised module list for all modules files 
 * which reside under the given path (items in sub folders are ignored) 
 * and then return their names. Module files provided by both plugins and the 
 * app itself will also be included.
 *
 * This is useful in situations where a particular path holds a number of 
 * related module files and you wish to see which ones are 
 * available.
 *
 * @param {string} path Path to check under.
 * @return {Array} List of module file names (without the file extension).
 * @throws Error if there was an error.
 */
loader.getModulesInPath = function(path) {
  if (!loader.__modules) {
    throw new Error('Please initialise Waigo first');
  }

  return _.filter(_.keys(loader.__modules), function(moduleFilePath) {
    return 0 === moduleFilePath.indexOf(path);
  });
};





/**
 * Get absolute path to folder containing the Waigo framework.
 * @return {String}
 */
loader.getWaigoFolder = function() {
  return waigoFolder;
};




/**
 * Get absolute path to folder containing the application code.
 * @return {String}
 */
loader.getAppFolder = function() {
  return appFolder;
};





module.exports = loader;
