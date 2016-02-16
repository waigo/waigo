"use strict";


const Robe = require('robe');


const waigo = global.waigo,
  _ = waigo._;



// keep track of connections
var _connections = [];


/**
 * Create a database connection.
 *
 * @param {Object} logger The app logger
 * @param {Object} dbConfig configuration
 * @param {String} dbConfig.hosts host/replica sets
 * @param {String} dbConfig.name db name
 *
 * @return {Object} db connection.
 */
exports.create = function*(logger, dbConfig) {
  logger.debug('Create db connection');

  let name = dbConfig.name,
    hosts = dbConfig.hosts;

  let mongoUrls = _.map(hosts, function(thisHost) {
    // user/passwd
    let auth = '';
    if (thisHost.user && thisHost.pass) {
      auth = thisHost.user + ':' + thisHost.pass + '@';
    }

    let url = auth + thisHost.host + ':' + thisHost.port + '/' + name;

    return url;
  });

  logger.debug('Connecting to Mongo hosts', mongoUrls);

  let db = yield Robe.connect(mongoUrls, {
    timeout: dbConfig.connectionTimeoutMs
  });

  _connections.push(db);

  // try and turn on the the oplog
  try {
    logger.debug('Initialising oplog watcher');

    var oplog = yield db.oplog();

    yield oplog.start();
  } catch (err) {
    logger.warn('Could not start the oplog watcher', err.stack);
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

  yield Q.map(_connections, function(db) {
    return db.close();
  });
};


