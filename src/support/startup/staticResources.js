"use strict";

/**
 * @fileOverview Setup static resources.
 */


var waigo = global.waigo,
  _ = waigo._;

var path = require('path'),
  shell = require('shelljs');



/**
 * Copy all built static resources from plugin and core framework folders into 
 * app's folder. And also setup static resource URL helper.
 *
 * This must be preceded by `globalHelpers` startup step.
 *
 * @param {Object} app The application.
 * @param {Object} [app.config.staticResources.folder] Path to static resources folder.
 */
module.exports = function*(app) {
  var logger = app.logger.create('StaticResources');
  
  var tmpFolder = path.join(shell.tempdir(), 'waigo-app-' + Date.now());

  logger.debug('Copy static resources into', tmpFolder);

  var sources = waigo.getSources();

  for (let key in sources) {
    // skip app's own
    if ('app' === key) {
      continue;
    }

    let src = path.join(sources[key], '..', 'public', '*'),
      dst = path.join(tmpFolder, key);

    logger.debug('Copying ' + src + ' -> ' + tmpFolder);

    shell.mkdir('-p', dst);
    shell.cp('-Rf', src, dst);

    // delete _gen folder in dst (if present)
    shell.rm('-rf', path.join(dst, '_gen'));
  }

  var destFolder = 
    path.join(waigo.getAppFolder(), app.config.staticResources.folder, '_gen');

  logger.debug('Copy ' + tmpFolder + ' -> ' + destFolder);
  shell.mkdir('-p', destFolder);
  shell.cp('-Rf', path.join(tmpFolder, '*'), destFolder);

  // Static URL helper
  app.locals.staticUrl = _.curry(_staticUrl, 2)(logger);
};


/**
 * Helper to generate static URL (relative to base site URL).
 *
 * The given `resourcePath` may be prefixed with `<module name>:`. This is extracted 
 * (if present) and used to generate the correct path. If not present then it 
 * is assumed that the static resource belongs to the app.
 * 
 * @param {String} resourcePath Path to static resource.
 * 
 * @return {String}
 */
var _staticUrl = function(logger, resourcePath) {
  var pos = resourcePath.indexOf(':'),
    owner =  (0 <= pos) ? resourcePath.substr(0, pos) : '',
    theUrl = (0 <= pos) ? resourcePath.substr(pos+1) : resourcePath;

  logger.trace('Static resource: ' + resourcePath + ' -> owner:' + owner + ', url:' + theUrl);

  if (
    /* app */ 
    !owner.length ||
    /* if want 'waigo' resource and the current app is the waigo framework itself */
      ('waigo' === owner && 0 === waigo.getAppFolder().indexOf(waigo.getWaigoFolder())) 
  ) {
    return path.join('/', theUrl);
  } else {
    return path.join('/_gen', owner, theUrl);
  }
};





