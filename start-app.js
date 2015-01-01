#!/usr/bin/env node
"use strict";

/**
 * @fileOverview Executable script to bootstrap your app.
 */



var spawn = require('child_process').spawn;


var app = spawn('node', ['--harmony', 'start-app-bootstrap.js'], {
  cwd: process.cwd(),
  env: process.env,
  stdio: 'inherit',
});


app.on('exit', function (code) {
  process.exit(code);
});
