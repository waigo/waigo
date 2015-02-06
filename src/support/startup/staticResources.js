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
  
  var destFolder = path.join(waigo.getAppFolder(), app.config.staticResources.folder, '__');

  logger.debug('Copy static resources into', destFolder);

  var sources = waigo.getSources();

  for (let key in sources) {
    // skip app's own
    if ('app' === key) {
      continue;
    }

    let src = path.join(sources[key], 'public', 'build', '*'),
      dst = path.join(destFolder, key);

    logger.debug('Copying ' + src + ' -> ' + dst);

    shell.cp('-R', src, dst);
  }
};


