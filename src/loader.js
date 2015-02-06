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
 * Reference to `lodash`.
 * 
 * Once waigo.load('application') has been called this will have been extended 
 * with `underscore.string` module and Waigo's 
 * enhanced mixins (see `support/underscore.js`).
 */
loader._ = _;


/** 
 * Internal file loading configuration. Do not access or manipulate this yourself. This is exposed purely for testing purposes.
 * @private
 */
loader.__files = null;




/**
 * Walk given folder and its subfolders and return all files.
 *
 * @param {String} folder Root folder.
 * @param {Object} [options] Additional options.
 * @param {String} [options.matchFolders] Filter sub-folders by this regex.
 * @param {String} [options.matchFiles] Filter files by this regex.
 * @param {String} [options.keepExtensions] If enabled then file names will keep their extensions.
 * 
 * @return {Promise}
 * @private
 */
var _walk = function(folder, options) {
  options = _.extend({
    matchFiles: /.+/ig,
    keepExtensions: false,
  }, options);

  return new Q(function(resolve, reject) {
    var files = {};

    var walker = walk(folder, {
      followSymlinks: false
    });

    walker.on('file', function(file, stat) {
      var dirname = path.dirname(file),
        filename = path.join(path.relative(folder, dirname), path.basename(file));

      if (!filename.match(options.matchFiles)) {
        return;
      }

      // strip extension from filename?
      if (!options.keepExtensions) {
        var extname = path.extname(filename),
          filename = filename.substr(0, filename.length - extname.length);
      }
      
      files[filename] = file;
    });  

    walker.on('end', function() {
      resolve(files);
    });  
  });
};





/**
 * Initialise the Waigo file loader.
 *
 * This scans the folder trees of the core framework, plugins and your
 * application to map out what's available and to ensure that there are no
 * instances of any given module file or view being provided by two or more 
 * plugins. For more information on how Waigo decides where to load files 
 * from see the `load()` and `getModulePath()` methods.
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
 * @param {String|Object} [options.plugins.config] JSON config containing names of plugins to load. If a string is given then it assumed to be the path of a script which exports configuration. Default is to load `package.json`.
 * @param {Array} [options.plugins.configKey] Names of keys in JSON config whose values contain names of plugins. Default is `dependencies, devDependencies, peerDependencies`.
 */
loader.init = function*(options) {
  if (loader.__files) {
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

  // reset cache
  loader.__files = {};

  // what paths will we search?
  var sourcePaths = {
    waigo: waigoFolder,
    app: appFolder
  };

  _.each(options.plugins.names, function(name) {
    sourcePaths[name] = path.join( path.dirname(require.resolve(name)), 'src' );
  });

  var scanOrder = ['waigo'].concat(options.plugins.names, 'app');

  // start scanning
  for (var i = 0; i < scanOrder.length; ++i) {
    var sourceName = scanOrder[i],
      moduleMap = {};

    debug('Scanning for files in: ' + sourceName);

    _.extend(moduleMap, yield _walk(sourcePaths[sourceName], {
        // only want .js files, but not any from cli/ or views/
        matchFiles: /^(?!(cli|views)\/)(.+?\.js)$/i,
      })
    );

    _.extend(moduleMap, yield _walk(sourcePaths[sourceName], {
        // only want files from views/, but not ones which are prefixed with an underscore
        matchFiles: /^views\/(.*\/)?(((?!_)[A-Za-z0-9])+\.?\w+)$/i,
        // may have many view templates with same names but different extensions
        keepExtensions: true,
      })
    );

    /*jshint -W083 */
    _.each(moduleMap, function(modulePath, moduleName) {
      loader.__files[moduleName] = loader.__files[moduleName] || { 
        sources: {} 
      };
      loader.__files[moduleName].sources[sourceName] = modulePath;
    });
  }

  // now go through the list of available modules and ensure that there are no ambiguities
  _.each(loader.__files, function(moduleConfig, moduleName) {
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
        throw new Error('Path "' + moduleName + '" has more than one plugin implementation to choose from: ' + pluginSources.join(', '));
      } 
      // else the one available plugin is the source
      else {
        moduleConfig._load = pluginSources[0];
      }
    }

    debug('File "' + moduleName + '" will be loaded from source "' + moduleConfig._load + '"');
  });
};







/**
 * Load a Waigo file.
 *
 * See `loader.getPath()` for more info.
 * 
 * @param {string} fileName File name in the supported format (see above).
 * @return {Object} contents of loaded file.
 * @throws Error if there was an error loading the file.
 */
loader.load = function(fileName) {
  return require(loader.getPath(fileName));
};





/**
 * Get path to a Waigo file.
 *
 * Names to load are specified in the form: `[npm_module_name:]<module_file_path>`
 *
 * If `npm_module_name:` is not given then Waigo works out the which version
 * of the file to load according to the following priority order: **App >
 * plugins > core framework**.
 *
 * Thus an app can completely override any of the framework's built-in
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
 * @param {String} fileName File name in the supported format (see above).
 * @return {String} Full path to file.
 */
loader.getPath = function(fileName) {
  if (!loader.__files) {
    throw new Error('Please initialise Waigo first');
  }

  // get source to load from
  var sanitizedFileName = fileName,
    source = null;

  var sepPos = fileName.indexOf(':')
  if (-1 < sepPos) {
    source = fileName.substr(0, sepPos);
    sanitizedFileName = fileName.substr(sepPos + 1);
  }

  if (!loader.__files[sanitizedFileName]) {
    throw new Error('File not found: ' + sanitizedFileName);
  }

  // if no source then use default
  if (!source) {
    source = loader.__files[sanitizedFileName]._load;
  }

  if (!loader.__files[sanitizedFileName].sources[source]) {
    throw new Error('File source not found: ' + source);
  }

  debug('File "' + fileName + '" points to "' + sanitizedFileName + '" from source "' + source + '"');

  return loader.__files[sanitizedFileName].sources[source];
};




/**
 * Get names of all files under a particular foder.
 *
 * This will look through the initialised file list for all files 
 * which reside under the given folder (items in sub-folders are ignored) 
 * and then return their names. Files provided by both plugins and the 
 * app itself will also be included.
 *
 * This is useful in situations where a particular folder holds a number of 
 * related files and you wish to see which ones are 
 * available.
 *
 * @param {String} folder Folder to check under, relative to application folder.
 * @return {Array} List of file names.
 * @throws Error if there was an error.
 */
loader.getFilesInFolder = function(folder) {
  if (!loader.__files) {
    throw new Error('Please initialise Waigo first');
  }

  var ret = 
    _(_.keys(loader.__files))
      .filter(function(filePath) {
        return 0 === filePath.indexOf(folder);
      })
      .value();

  return ret;
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
