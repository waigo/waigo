mongo = require('mongoskin');


/**
 * Create a Mongoskin db connection.
 *
 * @param dbConfig {Object} winston loggin configuration.
 *
 * @return {Object} db connection.
 */
exports.create = function(dbConfig) {
  var url = 'mongodb://' + dbConfig.host + ':' + dbConfig.port + '/' + dbConfig.db + '?auto_reconnect';
  return mongo.db(url);
};