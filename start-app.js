#!/usr/bin/env node
"use strict";

/**
 * @fileOverview Executable script to bootstrap your app.
 */

// get node version
var nodeVersion = process.versions.node;

// if node >= v0.12.0 OR ES6 enabled
if (nodeVersion >= '0.12.0' || 'function' === typeof Map) {
  require('./')._bootstrap(function(err) {
    if (err) {
      console.error(err.stack);
    }
  });
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



