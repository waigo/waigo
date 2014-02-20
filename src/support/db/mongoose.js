var mongoose = require('mongoose');

/**
 * # Mongoose database driver
 *
 * For creating MongoDB database connections.
 */



/**
 * Create a database connection.
 *
 * @param {Object} dbConfig configuration
 * @param {String} dbConfig.host server host
 * @param {Integer} dbConfig.port server port
 * @param {String} dbConfig.db database name
 *
 * @return {Object} db connection.
 */
exports.create = function(dbConfig) {
  var url = 'mongodb://' + dbConfig.host + ':' + dbConfig.port + '/' + dbConfig.db;
  mongoose.connect(url);
  return mongoose.connection;
};
