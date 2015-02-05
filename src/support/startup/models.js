"use strict";



var _ = require('lodash'),
  debug = require('debug')('waigo-startup-models'),
  path = require('path'),
  Robe = require('Robe'),
  waigo = require('../../../');



/**
 * Load models.
 *
 * @param {Object} app The application.
 */
module.exports = function*(app) {
  debug('Loading');

  var modelModuleFiles = waigo.getFilesInFolder('models');

  app.models = {};

  _.each(modelModuleFiles, function(modulePath) {
    debug('Loading ' + modulePath);

    var moduleFileName = path.basename(modulePath, path.extname(modulePath));

    var modelInfo = waigo.load(modulePath);

    var name = modelInfo.className || _.str.capitalize(moduleFileName),
      schema = modelInfo.schema || {},
      dbName = modelInfo.db || 'main',
      collectionName = modelInfo.collection || _.str.pluralize(name).toLowerCase();
    
    app.models[name] = app.dbs[dbName].collection(collectionName, modelInfo);

    debug('Added ' + name + ' -> ' + dbName  + '/' + collectionName);
  });
};
