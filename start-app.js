#!/usr/bin/env node
"use strict";

/**
 * @fileOverview Executable script to bootstrap your app.
 *
 * The code in this file must not use ES6 features as it it expected to be 
 * executed within non-ES6-supporting versions of Node too.
 */

var IS_WAIGO_FRAMEWORK = false;
try {
  IS_WAIGO_FRAMEWORK = ('waigo' === require('./package.json').name);
} catch (err) {
  console.warn('package.json not found');
}


// if < v4 then no can do
var semver = require('semver');
if (semver.lt(process.version, '4.0.0')) {
  throw new Error('Node v4.0.0+ required');
}

var cluster = require('cluster');


var _log = function(workerId, msg) {
  console.log('[worker' + workerId + '] ' + msg);
};

if (cluster.isMaster) {
  var numWorkers = process.env.WAIGO_WORKERS ? '' + process.env.WAIGO_WORKERS : '1';
  numWorkers = (numWorkers.toLowerCase()==='max_cpus' ? require('os').cpus().length : parseInt(numWorkers));

  console.log('No. of worker processes: ' + numWorkers);

  cluster.on('exit', function(worker, code, signal) {
    _log(worker.id, 'exited: ' + code + ', ' + signal);

    cluster.fork(); // restart
  });

  // fork workers
  for (var i = 0; i < numWorkers; i++) {
    cluster.fork();
  }
} else if (cluster.isWorker) {
  _log(cluster.worker.id, 'started, pid: ' + cluster.worker.process.pid);

  require(IS_WAIGO_FRAMEWORK ? './' : 'waigo')._bootstrap()
    .catch(function(err) {
      console.error(err.stack);
    });
}


