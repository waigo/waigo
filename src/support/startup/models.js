"use strict";



var _ = require('lodash'),
  debug = require('debug')('waigo-startup-models'),
  path = require('path'),
  waigo = require('../../../');

var modelBuilder = waigo.load('support/models/builder');


/**
 * Load models.
 *
 * @param {Object} app The application.
 */
module.exports = function*(app) {
  debug('loading');

  var modelModuleFiles = waigo.getModulesInPath('models');

  app.models = {};

  modelModuleFiles.forEach(function(modulePath) {
    var moduleFileName = path.basename(modulePath, path.extname(modulePath));

    var modelInfo = waigo.load(modulePath);

    var name = modelInfo.className || _.str.capitalize(moduleFileName),
      schema = modelInfo.schema || {},
      dbName = modelInfo.db || 'main',
      collectionName = modelInfo.collection || _.str.pluralize(name).toLowerCase();
    
    debug('adding ' + name + ' for ' + dbName  + '/' + collectionName);

    app.models[name] = modelBuilder.new({
      db: app.dbs[app.dbs],
      schema: schema,
      collection: collectionName,
    });
  });
};
