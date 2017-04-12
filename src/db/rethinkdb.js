const Thinodium = require('thinodium')


/**
 * Create a database connection.
 *
 * @param {Object} dbConfig configuration
 * @param {String} dbConfig.poolConfig connection pool config
 * @param {String} dbConfig.name db name
 *
 * @return {Object} db connection.
 */
exports.connect = function *(dbConfig) {
  return yield Thinodium.connect('rethinkdb', dbConfig.serverConfig)
}


/**
 * Disconnect a connection.
 *
 * @param {Object} db The database connection.
 */
exports.disconnect = function *(db) {
  if (db.isConnected) {
    yield db.disconnect()
  }
}

/**
 * Create a db model.
 *
 * @param {Object} db The database connection.
 * @param {String} modelName The model name.
 * @param {Object} modelSpec The model spec.
 */
exports.model = function *(db, modelName, modelSpec) {
  yield db.model(modelName, modelSpec)
}
