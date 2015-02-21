"use strict";



var debug = require('debug')('waigo-startup-models'),
  path = require('path'),
  Robe = require('Robe'),
  waigo = require('../../../'),
  _ = waigo._,
  viewObjects = waigo.load('support/viewObjects');



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
      dbName = modelInfo.db || 'main',
      collectionName = modelInfo.collection || _.str.pluralize(name).toLowerCase();
    
    // add view object docMethod (but can be overridden for each method)
    var docMethods = {};
    docMethods[viewObjects.methodName] = function*(ctx) {
      return this.toJSON();
    };
    modelInfo.docMethods = _.extend(docMethods, modelInfo.docMethods);

    app.models[name] = app.dbs[dbName].collection(collectionName, modelInfo);

    debug('Added ' + name + ' -> ' + dbName  + '/' + collectionName);
  });
};
