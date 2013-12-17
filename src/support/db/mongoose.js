mongoose = require('mongoose');


/**
 * Create a Mongoose db connection.
 *
 * @param dbConfig {Object} configuration.
 *
 * @return {Object} db connection.
 */
exports.create = function(dbConfig) {
  var url = 'mongodb://' + dbConfig.host + ':' + dbConfig.port + '/' + dbConfig.db;
  mongoose.connect(url);
  return mongoose.connection;
};