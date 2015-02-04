"use strict";


var debug = require('debug')('waigo-db-mongo'),
  Robe = require('robe'),
  Q = require('bluebird');

var waigo = require('../../../'),
  _ = waigo._;



// keep track of connections
var _connections = [];


/**
 * Create a database connection.
 *
 * @param {Object} dbConfig configuration
 * @param {String} dbConfig.hosts host/replica sets
 * @param {String} dbConfig.name db name
 *
 * @return {Object} db connection.
 */
exports.create = function*(dbConfig) {
  debug('create connection');

  var name = dbConfig.name,
    hosts = dbConfig.hosts;

  var mongoUrls = _.map(hosts, function(thisHost) {
    // user/passwd
    var auth = '';
    if (thisHost.user && thisHost.pass) {
      auth = thisHost.user + ':' + thisHost.pass + '@';
    }

    var url = auth + thisHost.host + ':' + thisHost.port + '/' + name;

    debug(url);

    return url;
  });

  var db = yield Robe.connect(Mongorito, mongoUrls);

  _connections.push(db);

  return db;
};



/**
 * Shutdown all database connections.
 */
exports.closeAll = function*() {
  debug('close all connections');

  yield Q.map(_connections, function(db) {
    return db.close();
  });
};
