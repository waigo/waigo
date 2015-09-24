"use strict";



var debug = require('debug')('waigo-startup-models'),
  path = require('path'),
  Robe = require('robe'),
  waigo = global.waigo,
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

  for (let _i in modelModuleFiles) {
    let modulePath = modelModuleFiles[_i];

    debug('Loading ' + modulePath);

    var moduleFileName = path.basename(modulePath, path.extname(modulePath));

    var modelInfo = waigo.load(modulePath);

    var name = modelInfo.className || _.capitalize(moduleFileName),
      dbName = modelInfo.db || 'main',
      collectionName = modelInfo.collection || _.pluralize(name).toLowerCase();
    
    // add view object docMethod (but can be overridden for each model)
    var colMethods = modelInfo.methods || {},
      docMethods = {};
    docMethods[viewObjects.methodName] = function*(ctx) {
      return this.toJSON();
    };

    // add method to fetch app
    colMethods.getApp = docMethods.getApp = function() {
      return app;
    };

    // add method to record to activity log
    colMethods.record = docMethods.record = function*() {
      if (app.record) {
        yield app.record.apply(app, arguments);
      }
    };

    modelInfo.docMethods = _.extend(docMethods, modelInfo.docMethods);

    // create model instance
    let Model = app.dbs[dbName].collection(collectionName, modelInfo);
    app.models[name] = Model;

    app.logger.debug('Added model', name, dbName  + '/' + collectionName);

    // ensure indexes are created
    debug('Ensure indexes', dbName, collectionName);

    yield Model.ensureIndexes();
  }
};
