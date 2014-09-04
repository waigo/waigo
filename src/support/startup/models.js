"use strict";



var _ = require('lodash'),
  debug = require('debug')('waigo-startup-models'),
  path = require('path'),
  waigo = require('../../../');


/**
 * Load models.
 *
 * This requires the 'database' startup step to be enabled.
 *
 * @param {Object} app The application.
 */
module.exports = function*(app) {
  var modelModuleFiles = waigo.getModulesInPath('models');

  debug('Loading models');

  app.models = {};

  modelModuleFiles.forEach(function(modulePath) {
    var filename = _.str.capitalize(
      path.basename(modulePath, path.extname(modulePath))
    );

    var modelClass = waigo.load(modulePath)(app.db);
    
    var name = modelClass.modelName || filename;

    debug('Adding model (' + filename + '): ' + name);

    app.models[name] = modelClass;
  });
};
