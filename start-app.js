#!/usr/bin/env node
"use strict";

/**
 * @fileOverview Executable script to bootstrap your app.
 */

var IS_WAIGO_FRAMEWORK = false;
try {
  IS_WAIGO_FRAMEWORK = ('waigo' === require('./package.json').name);
} catch (err) {
  console.warn('package.json not found');
}



function spawnNodeCluster() {
  var cluster = require('cluster');

  var numWorkers = parseInt(process.env.WAIGO_WORKERS || 0) 
    || require('os').cpus().length;

  var _log = function(workerId, msg) {
    console.log('[worker' + workerId + '] ' + msg);
  };

  if (cluster.isMaster) {
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
}


// if node <0.11 then no can do
var semver = require('semver');
if (semver.lt(process.version, '0.12.0')) {
  throw new Error('Node v0.12.0+ required');
}


// check if ES6 enabled (works for Node 0.11.x and 0.12.x)
var es6Enabled = false;
try {
  require('vm').runInNewContext('var a = function*() {};');
  es6Enabled = true;
} catch (err) {
  es6Enabled = false;
}

// if ES6 enabled
if (es6Enabled) {
  spawnNodeCluster();
}
// else run this script again with the --harmony flag
else {
  var spawn = require('child_process').spawn;

  var app = spawn('node', ['--harmony', __filename], {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit',
  });

  app.on('exit', function (code) {
    process.exit(code);
  });
}