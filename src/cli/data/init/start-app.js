#!/usr/bin/env node
"use strict";

/**
 * @fileOverview Executable script to bootstrap your app.
 */

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
  require('waigo')._bootstrap(function(err) {
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



