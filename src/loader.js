"use strict";
/**
 * @file The module loader.
 */


const _ = require('lodash'),
  debug = require('debug')('waigo_loader'),
  findup = require('findup-sync'),
  path = require('path'),
  fs = require('fs'),
  globule = require('globule'),
  walk = require('findit');


const WAIGO_FOLDER = __dirname,
  DEFAULT_APP_FOLDER = path.join(path.dirname(require.main.filename), 'src'),
  $FILE = Symbol('file loading config'),
  $SOURCE_PATHS = Symbol('paths to sources');



var appFolder = null;

var loader = module.exports = global.waigo = {};



/**
 * Reference to Lodash instance.
 * 
 * Once waigo.load('application') has been called this will have been extended 
 * with `underscore.string` module and Waigo's 
 * enhanced mixins (see `support/underscore.js`).
 */
loader._ = _;


/** 
 * Internal file loading configuration.
 * @private
 */
loader[$FILE] = null;


/** 
 * Internal paths to file sources.
 * @private
 */
loader[$SOURCE_PATHS] = null;



/**
 * Walk given folder and its subfolders and return all files.
 *
 * @param {String} folder Root folder.
 * @param {Object} [options] Additional options.
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

  return new Promise(function(resolve, reject) {
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
 * Reset the internal file loader configuration.
 *
 * NOTE: `init()` must be called after this to re-initialize the loader.
 * @return {[type]} [description]
 */
loader.reset = function() {
  debug('Reset loader config');

  appFolder = null;
  loader[$FILE] = null;
  loader[$SOURCE_PATHS] = null;
};





/**
 * Initialise the Waigo file loader.
 *
 * This scans the folder trees of the core framework, plugins and your
 * application to map out what's available and to ensure that there are no
 * instances of any given file or view being provided by two or more 
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
 * @param {Array} [options.plugins.names] Names of plugins to load. If omitted then other options are used to load plugins.
 * @param {Array} [options.plugins.glob] Regexes specifying plugin naming conventions. Default is `waigo-plugin-*`.
 * @param {String|Object} [options.plugins.config] JSON config containing names of plugins to load. If a string is given then it assumed to be the path of a script which exports the configuration. Default is to load `package.json`.
 * @param {Array} [options.plugins.configKey] Names of keys in JSON config whose child keys contain names of plugins. Default is `[dependencies, devDependencies, peerDependencies]`.
 *
 * @return {Object} Final augmented options, in which ase you wish to check loading config.
 */
loader.init = function*(options) {
  if (loader[$FILE]) {
    debug('Waigo was already initialised. Re-initialising...');

    loader.reset();
  }

  options = JSON.parse(JSON.stringify(options || {}));
  options.plugins = options.plugins || {};

  appFolder = options.appFolder || DEFAULT_APP_FOLDER;
  debug('App folder ' + appFolder);

  // get loadable plugin
  if (!options.plugins.names) {
    debug('Getting plugin names...');
    
    // based on code from https://github.com/sindresorhus/load-grunt-tasks/blob/master/load-grunt-tasks.js
    let pattern = options.plugins.glob || ['waigo-plugin-*'];
    let config = options.plugins.config || null;
    let scope = options.plugins.configKey || ['dependencies', 'devDependencies', 'peerDependencies'];
    
    if (null === config || typeof config === 'string') {
      let pathToConfig = config;

      if (!pathToConfig || 'package.json' === pathToConfig) {
        pathToConfig = findup('package.json', {
          cwd: appFolder
        });

        if (!pathToConfig) {
          throw new Error(`Unable to find package.json`);
        }
      }

      try {
        config = loader.__require(path.resolve(pathToConfig));
      } catch (err) {
        throw new Error(`Unable to load config file: ${pathToConfig}`);
      }
    }

    let names = scope.reduce(function (result, prop) {
      return result.concat(Object.keys(config[prop] || {}));
    }, []);

    options.plugins.names = _.uniq(globule.match(pattern, names));
  }
  
  debug(`Plugins to load: ${options.plugins.names.join(', ')}`);

  // what paths will we search?
  let sourcePaths = loader[$SOURCE_PATHS] = {
    waigo: WAIGO_FOLDER,
    app: appFolder
  };

  _.each(options.plugins.names, function(name) {
    let fullPath;

    try {
      fullPath = path.dirname(require.resolve(name));
    } catch (err) {
      if (process.env.PLUGIN_SEARCH_FOLDER) {
        fullPath = path.join(process.env.PLUGIN_SEARCH_FOLDER, name);

        let stat = fs.statSync(fullPath);

        if (!stat.isDirectory()) {
          throw err;
        }
      } else {
        throw err;
      }
    }

    sourcePaths[name] = path.join(fullPath, 'src');
  });

  let scanOrder = ['waigo'].concat(options.plugins.names, 'app');

  // reset cache
  loader[$FILE] = {};

  // start scanning
  for (let sourceName of scanOrder) {
    let moduleMap = {};

    debug(`Scanning for files in: ${sourceName}`);

    _.extend(moduleMap, yield _walk(sourcePaths[sourceName], {
        // only want .js files, but not any from frontend/ views/ or cli/data
        matchFiles: /^(?!(frontend|views|cli\/data)\/)(.+?\.js)$/i,
      })
    );

    _.extend(moduleMap, yield _walk(sourcePaths[sourceName], {
        // only want files from views/ and emails/, but not ones which are prefixed with an underscore
        matchFiles: /^(views|emails)\/(.*\/)?(((?!_)[A-Za-z0-9_]+)\.?\w+)$/i,
        // may have many view templates with same names but different extensions
        keepExtensions: true,
      })
    );

    /*jshint -W083 */
    _.each(moduleMap, function(modulePath, moduleName) {
      loader[$FILE] = loader[$FILE] || {};
      loader[$FILE][moduleName] = _.get(loader[$FILE], moduleName, { 
        sources: {} 
      });
      loader[$FILE][moduleName].sources[sourceName] = modulePath;
    });
  }

  // now go through the list of available modules and ensure that there are no ambiguities
  _.each(loader[$FILE], function(moduleConfig, moduleName) {
    let sourceNames = Object.keys(moduleConfig.sources);

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
      let pluginSources = _.filter(sourceNames, function(srcName) {
        return 'waigo' !== srcName;
      });

      // if more than one plugin then we have a problem
      if (1 < pluginSources.length) {
        throw new Error(`Path "${moduleName}" has more than one plugin implementation to choose from: ${pluginSources.join(', ')}`);
      } 
      // else the one available plugin is the source
      else {
        moduleConfig._load = pluginSources[0];
      }
    }

    debug(`File "${moduleName}" will be loaded from source "${moduleConfig._load}"`);
  });

  return options;
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
  let resolvedPath = loader.getPath(fileName);

  debug(`Load ${fileName} -> ${resolvedPath}`);

  return loader.__require(resolvedPath);
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
  if (!loader[$FILE]) {
    throw new Error('Please initialise Waigo first');
  }

  // get source to load from
  let sanitizedFileName = fileName,
    source = null;

  let sepPos = fileName.indexOf(':')
  if (-1 < sepPos) {
    source = fileName.substr(0, sepPos);
    sanitizedFileName = fileName.substr(sepPos + 1);
  }

  if (!loader[$FILE][sanitizedFileName]) {
    throw new Error(`File not found: ${sanitizedFileName}`);
  }

  // if no source then use default
  if (!source) {
    source = loader[$FILE][sanitizedFileName]._load;
  }

  if (!loader[$FILE][sanitizedFileName].sources[source]) {
    throw new Error(`File source not found: ${source}`);
  }

  debug(`File "${fileName}" points to "${sanitizedFileName}" from source "${source}"`);

  return loader[$FILE][sanitizedFileName].sources[source];
};





/**
 * Get file sources.
 *
 * This will return key-value pairs, where the key is the name of the source and 
 * the value is that path to the `src` folder for that source.
 *
 * When calling `waigo.load()` and/or `waigo.getPath()` is is this list which 
 * tells Waigo where to look for files.
 *
 * @return {Object}
 */
loader.getSources = function() {
  return loader[$SOURCE_PATHS];
};




/**
 * Get all items under a particular foder.
 *
 * This will look through the initialised file list for all files
 * which reside under the given folder (and subfolders) and then return their names. 
 * Files provided by both plugins and the app itself will also be included.
 *
 * This is useful in situations where a particular folder holds a number of 
 * related files/folders and you wish to see which ones are available.
 *
 * @param {String} folder Folder to check under, relative to application folder.
 * @return {Array} List of file names.
 * @throws Error if there was an error.
 */
loader.getItemsInFolder = function(folder) {
  if (!loader[$FILE]) {
    throw new Error('Please initialise Waigo first');
  }

  var ret = _.chain(loader[$FILE])
    .keys()
    .filter(function(filePath) {
      return (0 === filePath.indexOf(folder));
    })
    .value();

  return ret;
};





/**
 * Get absolute path to folder containing the Waigo framework.
 * @return {String}
 */
loader.getWaigoFolder = function() {
  return WAIGO_FOLDER;
};




/**
 * Get absolute path to folder containing the application code.
 * @return {String}
 */
loader.getAppFolder = function() {
  return appFolder;
};



/**
 * Load given item using `require()`.
 *
 * @param  {String} p path or module name.
 * @return {Module}
 */
loader.__require = function(p) {
  return require(p);
};

