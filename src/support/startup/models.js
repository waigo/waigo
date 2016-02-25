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

  let modelModuleFiles = _.chain(waigo.getItemsInFolder('models'))
    .filter((file) => {
      return _.endsWith(file, 'model');
    })
    .value();

  app.models = {};

  for (let modulePath of modelModuleFiles) {
    let modelName = path.basename(
      modulePath.substr(0, modulePath.length - ('/model').length)
    );

    app.logger.debug(`Loading ${modelName}`);

    let ModelClass = waigo.load(modulePath),
      model = new ModelClass(app);

    yield model.init();

    app.models[model.name] = model;

    app.logger.debug('Added model', model.name);
  }
};
