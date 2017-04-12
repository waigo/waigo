const waigo = global.waigo


class DbWrapper {
  /**
   * @constructor
   * @param {Object} id Database id.
   * @param {Object} logger The app logger
   * @param {String} type Database engine type
   * @param {Object} dbConfig db engine options
   */
  constructor (id, logger, type, dbConfig) {
    this.id = id
    this.logger = logger
    this.type = type
    this.dbConfig = dbConfig

    this.logger.debug(`Loading db adapater for ${this.type}`)

    this.builder = waigo.load(`db/${this.type}`)
    this.models = {}
  }

  /**
   * Initialize this connection
   */
  *init () {
    this.logger.info(`Creating connection ${this.id} of type ${this.type}`)

    this.db = yield this.builder.connect(this.dbConfig)
  }

  /**
   * Destroy this connection
   */
  *destroy () {
    this.logger.info(`Disconnecting connection ${this.id}`)

    if (this.db) {
      yield this.builder.disconnect(this.db)
    }
  }

  *model (modelName, modelSpec = {}) {
    if (!this.models[modelName]) {
      this.logger.info(`Setting up model ${modelName}`)

      this.models[modelName] = this.builder.model(this.db, modelName, modelSpec)
    }

    return this.models[modelName]
  }
}

module.exports = DbWrapper
