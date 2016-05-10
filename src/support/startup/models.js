"use strict";


const path = require('path');

const waigo = global.waigo,
  _ = waigo._,
  logger = waigo.load('support/logger').create('Models'),
  viewObjects = waigo.load('support/viewObjects');



/**
 * Load models.
 *
 * @param {Object} app The application.
 */
module.exports = function*(app) {
  app.logger.debug('Loading models');

  let modelModuleFiles = waigo.getItemsInFolder('models');

  app.models = {};

  for (let modulePath of modelModuleFiles) {
    let modelName = _.capitalize(path.basename(modulePath));

    app.logger.debug(`Loading ${modelName}`);

    let modelConfig = waigo.load(modulePath);

    let modelLogger = logger.create(modelName);

    // add logger and app getter methods
    let helperMethods = {
      _logger: () => modelLogger,
      _app: () => app,      
    };

    modelConfig.docMethods = _.extend({}, modelConfig.docMethods, helperMethods);
    modelConfig.docMethods[viewObjects.METHOD_NAME] = function*() {
      return this.toJSON();
    };
    
    modelConfig.modelMethods = _.extend({}, modelConfig.modelMethods, helperMethods);

    app.models[modelName] = yield app.db.model(modelName, modelConfig);

    app.logger.debug('Added model', modelName);
  }
};
