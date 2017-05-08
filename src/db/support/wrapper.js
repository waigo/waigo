const waigo = global.waigo,
  _ = waigo._


class DbWrapper {
  /**
   * @constructor
   * @param {Object} id Database id.
   * @param {Object} logger The app logger
   * @param {String} type Database engine type
   * @param {Object} dbConfig db engine options
   */
  constructor (App, id, logger, type, dbConfig) {
    this.App = App
    this.id = id
    this.logger = logger
    this.type = type
    this.dbConfig = dbConfig

    this.logger.debug(`Loading ${this.type} adapter for connection: ${this.id}`)

    this.builder = waigo.load(`db/${this.type}/adapter`)
    this.models = {}
  }

  /**
   * Initialize this connection
   */
  *init () {
    this.logger.debug(`Creating ${this.type} connection: ${this.id}`)

    this.db = yield this.builder.connect(this.dbConfig)

    this.logger.debug(`Created connection ${this.id}`)
  }

  /**
   * Destroy this connection
   */
  *destroy () {
    this.logger.debug(`Disconnecting connection ${this.id}`)

    if (this.db) {
      yield this.builder.disconnect(this.db)

      this.logger.debug(`Disconnected connection ${this.id}`)
    }
  }

  *model (modelName, modelSpec = {}) {
    if (!this.models[modelName]) {
      this.logger.debug(`Setting up model ${modelName}`)

      modelSpec = _.extend({},
        waigo.load(`db/${this.type}/models/${modelName.toLowerCase()}`),
        modelSpec
      )

      this.models[modelName] = yield this.builder.model(this.db, modelName, modelSpec)
    }

    return this.models[modelName]
  }
}

module.exports = DbWrapper
