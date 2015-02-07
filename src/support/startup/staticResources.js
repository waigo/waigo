"use strict";

/**
 * @fileOverview Setup static resources.
 */


var waigo = require('../../../'),
  _ = waigo._;

var path = require('path'),
  shell = require('shelljs');



/**
 * Copy all built static resources from plugin and core framework folders into 
 * app's folder.
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
  }

  var destFolder = 
    path.join(waigo.getAppFolder(), app.config.staticResources.folder, '_gen');

  logger.debug('Copy ' + tmpFolder + ' -> ' + destFolder);
  shell.mkdir('-p', destFolder);
  shell.cp('-Rf', path.join(tmpFolder, '*'), destFolder);
};


