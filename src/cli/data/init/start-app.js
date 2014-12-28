#!/usr/bin/env node
"use strict";


/**
 * @fileOverview Executable script to bootstrap your app.
 */


// Turn on Harmony features
var v8flags = require('v8-flags');
v8flags.harmony(true);


// bootstrap!
require('waigo').load('bootstrap');


