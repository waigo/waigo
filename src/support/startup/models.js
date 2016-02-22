"use strict";


const path = require('path'),
  thinky = require('thinky')();

const waigo = global.waigo,
  _ = waigo._,
  viewObjects = waigo.load('support/viewObjects');



/**
 * Load models.
 *
 * @param {Object} app The application.
 */
module.exports = function*(app) {
  app.logger.debug('Loading models');

  let modelModuleFiles = waigo.getFilesInFolder('models');

  app.models = {};

  for (let modulePath of modelModuleFiles) {
    app.logger.debug(`Loading ${modulePath}`);

    let moduleFileName = path.basename(modulePath, path.extname(modulePath)),
      modelConfig = waigo.load(modulePath),
      model = modelConfig(app);

    let name = model.modelName || _.capitalize(moduleFileName);

    app.models[name] = Model;

    app.logger.debug('Added model', name);
  }
};
