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
 * @param {Object} id Database id.
 * @param {Object} logger The app logger
 * @param {Object} dbConfig configuration
 * @param {String} dbConfig.poolConfig connection pool config
 * @param {String} dbConfig.name db name
 *
 * @return {Object} db connection.
 */
exports.create = function*(id, logger, dbConfig) {
  logger.log('Connecting to RethinkDB', id);

  const db = rethinkdb(dbConfig.serverConfig);

  yield new Q((resolve, reject) => {
    let connected = false;

    db.getPoolMaster().on('available-size', (size) => {
      if (connected) {
        return;
      }

      logger.debug(`RethinkDB connected (${id})`);

      connected = true;
      resolve();
    });

    db.getPoolMaster()._flushErrors = () => {};

    db.getPoolMaster().on('healthy', (healthy) => {
      if (healthy) {
        logger.trace(`RethinkDB connected (${id})`);
      } else {
        reject(new Error(`RethinkDB connection failed: (${id})`));
      }
    });
  });

  _connections.push(db);

  // check that db exists
  let dbList = yield db.dbList();
  if (0 > dbList.indexOf(dbConfig.serverConfig.db)) {
    try {
      logger.debug(`Create database: ${dbConfig.serverConfig.db}`);

      yield db.dbCreate(dbConfig.serverConfig.db);
    } catch (err) {
      logger.error(`Unable to create database: ${dbConfig.serverConfig.db}`);

      throw err;
    }
  }

  return db;
};




/**
 * Shutdown all database connections.
 *
 * @param {Object} logger The app logger
 */
exports.closeAll = function*(logger) {
  logger.debug('Close all connections');

  yield _.map(_connections, (db) => {
    return db.getPoolMaster().drain();
  });
};


