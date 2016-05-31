"use strict";


const waigo = global.waigo,
  _ = waigo._,
  logger = waigo.load('support/logger').create('rethinkdb'),
  Q = waigo.load('support/promise'),
  Thinodium = require('thinodium');



// keep track of connections
var _connections = {};




/**
 * Create a database connection.
 *
 * @param {Object} id Database id.
 * @param {Object} logger The app logger
 * @param {Object} dbConfig configuration
 * @param {String} dbConfig.poolConfig connection pool config
 * @param {String} dbConfig.name db name
 *
 * @return {Object} db connection.
 */
exports.create = function*(id, logger, dbConfig) {
  logger.info('Connecting to RethinkDB', id);

  let db = yield Thinodium.connect('rethinkdb', dbConfig.serverConfig);

  _connections[id] = db;

  return db;
};




/**
 * Shutdown all database connections.
 *
 * @param {Object} logger The app logger
 */
exports.closeAll = function*(logger) {
  logger.info('Close all connections');

  yield _.map(_connections, (db) => {
    return Q.try(() => {
      if (db.isConnected) {
        return db.disconnect()
      }      
    });
  });
};


