"use strict";


const rethinkdb = require('rethinkdbdash');

const waigo = global.waigo,
  _ = waigo._,
  Q = waigo.load('support/promise');



// keep track of connections
var _connections = [];




/**
 * Create a database connection.
 *
 * @param {Object} logger The app logger
 * @param {Object} dbConfig configuration
 * @param {String} dbConfig.poolConfig connection pool config
 * @param {String} dbConfig.name db name
 *
 * @return {Object} db connection.
 */
exports.create = function*(logger, dbConfig) {
  logger.log('Connecting to RethinkDB', dbConfig.name);

  const db = rethinkdb(dbConfig.serverConfig);

  // yield db.connect();

  yield new Q((resolve, reject) => {
    let connected = false;

    db.getPoolMaster().on('available-size', (size) => {
      if (connected) {
        return;
      }

      logger.debug(`RethinkDB connected (${dbConfig.name})`);

      connected = true;
      resolve();
    });

    db.getPoolMaster()._flushErrors = () => {};

    db.getPoolMaster().on('healthy', (healthy) => {
      if (healthy) {
        logger.trace(`RethinkDB connected (${dbConfig.name})`);
      } else {
        reject(new Error(`RethinkDB connection failed: (${dbConfig.name})`));
      }
    });
  });

  _connections.push(db);

  return db;
};




/**
 * Shutdown all database connections.
 *
 * @param {Object} logger The app logger
 */
exports.closeAll = function*(logger) {
  logger.debug('Close all connections');

  yield _.map(connections, (db) => {
    return db.getPoolMaster().drain();
  });
};


