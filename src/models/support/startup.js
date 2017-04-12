const path = require('path')

const waigo = global.waigo,
  _ = waigo._,
  logger = waigo.load('logger').create('Models')



/**
 * Load models.
 *
 * @param {Object} App The application.
 */
module.exports = function *(App) {
  App.logger.debug('Loading models')

  const modelModuleFiles = waigo.getItemsInFolder('models')

  App.models = {}

  for (const modulePath of modelModuleFiles) {
    const modelName = _.capitalize(path.basename(modulePath))

    App.logger.debug(`Loading ${modelName}`)

    const ModelClass = waigo.load(modulePath)

    const m = new ModelClass(App, logger.create(modelName))

    yield m.init()

    App.models[modelName] = m

    App.logger.debug('Loaded model', modelName)
  }
}
