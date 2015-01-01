"use strict";


var debug = require('debug')('waigo-db-mongo'),
  Mongorito = require('mongorito'),
  Q = require('bluebird');



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

  var mongoUrls = _.map(hosts, function(soFar, thisHost) {
    // user/passwd
    var auth = '';
    if (thisHost.user && thisHost.pass) {
      auth = thisHost.user + ':' + thisHost.pass + '@';
    }

    var url = return auth + thisHost.host + ':' + thisHost.port + '/' + name;

    debug(url);

    return url;
  });

  var db = Mongorito.connect.apply(mongoUrls);

  yield new Q(function(resolve, reject) {
    var connectionTimeout = setTimeout(function() {
      reject(new Error('Timed out waiting to connect to db'));
    }, 10000);  // 10 seconds timeout

    db.once('open', function() {
      clearTimeout(connectionTimeout);
      _connections.push(db);

      debug('connection established');

      resolve(db);
    });
  });
};



/**
 * Shutdown all database connections.
 */
exports.closeAll = function*() {
  debug('close all connections');

  yield Q.map(_connections, function(c) {
    return new Q(function(resolve, reject) {
      c.close(function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      })
    });
  })
};
