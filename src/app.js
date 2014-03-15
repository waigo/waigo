"use strict";


var _ = require('lodash'),
  debug = require('debug')('waigo-server'),
  koa = require('koa'),
  path = require('path'),
  Promise = require('bluebird'),
  moment = require('moment'),
  waigo = require('../');

_.str = require('underscore.string');

/** 
 * # Server initialisation
 *
 * This module contains the main entry point for all Waigo applications. It is responsible for constructing the Koa app object 
 * and initialising logging, database connections, sessions and the various middleware components amongst other things.
 */


/** 
 * The Koa application object.
 * @type {Object}
 */
var app = module.exports = koa();





/**
 * Load in the application [configuration](config/index.js.html).
 *
 * @protected
 */
app.loadConfig = function*() {
  debug('Loading configuration');
  app.config = waigo.load('config/index')();
};





/**
 * Start the Koa application.
 *
 * This is a convenience method for initialising the various parts of the app and setting up the general middleware chain.
 *
 * @return {Object} The result of the call to `app.listen()`.
 * @public
 */
app.start = function*() {
  yield* app.loadConfig();

  var ret = null;
  for (let idx in app.config.startupSteps) {
    let stepName = app.config.startupSteps[idx];
    debug('Running startup step: ' + stepName);
    ret = yield* waigo.load('support/startup/' + stepName)(app);
  }

  return ret;
};

