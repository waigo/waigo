"use strict";


var _ = require('lodash'),
  debug = require('debug')('waigo-app'),
  koa = require('koa'),
  path = require('path'),
  Q = require('bluebird'),
  moment = require('moment'),
  waigo = require('../');

_.str = require('underscore.string');

/** 
 * # Waigo application
 *
 * This module contains the main entry point for all Waigo applications. It is responsible for constructing the Koa `app` object 
 * and initialising logging, database connections, sessions and the various middleware components amongst other things.
 */


/** 
 * The application object.
 *
 * This holds a reference to the koa `app` object.
 * 
 * @type {Object}
 */
var App = module.exports = {
  app: koa()
};





/**
 * Load in the application configuration.
 *
 * @protected
 */
App.loadConfig = function*() {
  debug('Loading configuration');
  App.app.config = waigo.load('config/index')();
};





/**
 * Start the Koa application.
 *
 * This is a convenience method for initialising the various parts of the app and setting up the general middleware chain.
 *
 * @return {Object} The result of the call to the final startup step.
 * @public
 */
App.start = function*() {
  yield* App.loadConfig();

  for (let idx in App.app.config.startupSteps) {
    let stepName = App.app.config.startupSteps[idx];
    debug('Running startup step: ' + stepName);
    yield* waigo.load('support/startup/' + stepName)(App.app);
  }
};




/**
 * Stop the currently running application.
 */
App.shutdown = function*() {
  if (App.app.server) {
    debug('Shutting down HTTP server');
    yield Q.promisify(App.app.server.close, App.app.server)();
  } 

  // prepare the koa app for a restart
  debug('Resetting koa app');
  App.app = koa();
};



