"use strict";



var debug = require('debug')('waigo-db-mongoose'),
  mongoose = require('mongoose-q')(require('mongoose')),
  Promise = require('bluebird');

/**
 * # Mongo database connection.
 *
 * This uses mongoose to create the connection.
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
exports.create = function*(dbConfig) {
  var url = 'mongodb://' + dbConfig.host + ':' + dbConfig.port + '/' + dbConfig.db;
  debug(url);

  var db = mongoose.createConnection(url);
  
  return yield new Promise(function(resolve, reject) {
    db.on('error', function(err) {
      debug('Connection failed');
      reject(err);
    });
    db.once('open', function() {
      debug('Connection succeeded');
      db.removeListener('error', reject);
      resolve(db);
    });
  });
};
