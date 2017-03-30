


const path = require('path');

const waigo = global.waigo,
  _ = waigo._,
  logger = waigo.load('support/logger').create('Models'),
  viewObjects = waigo.load('support/viewObjects');



/**
 * Load models.
 *
 * @param {Object} App The application.
 */
module.exports = function*(App) {
  App.logger.debug('Loading models');

  let modelModuleFiles = waigo.getItemsInFolder('models');

  App.models = {};

  for (let modulePath of modelModuleFiles) {
    let modelName = _.capitalize(path.basename(modulePath));

    App.logger.debug(`Loading ${modelName}`);

    let modelConfig = waigo.load(modulePath);

    let modelLogger = logger.create(modelName);

    // add logger and app getter methods
    let helperMethods = {
      _logger: () => modelLogger,
      _App: () => App,      
    };

    modelConfig.docMethods = _.extend({}, modelConfig.docMethods, helperMethods);
    modelConfig.docMethods[viewObjects.METHOD_NAME] = function*() {
      return this.toJSON();
    };
    
    modelConfig.modelMethods = _.extend({}, modelConfig.modelMethods, helperMethods);

    App.models[modelName] = yield App.db.model(modelName, modelConfig);

    App.logger.debug('Added model', modelName);
  }
};
