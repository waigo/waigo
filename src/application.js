"use strict";


var _ = require('lodash'),
  debug = require('debug')('waigo-app'),
  koa = require('koa'),
  path = require('path'),
  Q = require('bluebird'),
  moment = require('moment'),
  waigo = require('../');

// underscore mixins
_.str = require('underscore.string');
_.mixin(waigo.load('support/underscore'));



/** 
 * The application object is the main entry point for all Waigo applications.
 * 
 * It is responsible for constructing the Koa `app` object and initialising
 * logging, database connections, sessions and the various middleware
 * components amongst other things.
 *
 * Internally it holds a reference to the Koa `app` object.
 */
var App = module.exports = {
  app: koa()
};





/**
 * Load in the application configuration.
 *
 * This gets called automatically from `start()` and should not be called 
 * directly.
 *
 * @param {Object} [options] Additional options.
 * @param {Function} [options.postConfig] Function to pass configuration object to once loaded. Useful for performing dynamic runtime configuration.
 * 
 * @protected
 */
App.loadConfig = function*(options) {
  options = options || {};

  debug('Loading configuration');
  App.app.config = waigo.load('config/index')();

  if (options.postConfig) {
    debug('Executing dynamic configuration');
    options.postConfig.call(null, App.app.config);
  }
};





/**
 * Start the Koa application.
 *
 * This is a convenience method for initialising the various parts of the app and setting up the general middleware chain.
 *
 * @param {Object} [options] Additional options.
 * @param {Function} [options.postConfig] see `loadConfig()`.
 * 
 * @return {Object} The result of the call to the final startup step.
 */
App.start = function*(options) {
  yield* App.loadConfig(options);

  for (let idx in App.app.config.startupSteps) {
    let stepName = App.app.config.startupSteps[idx];
    debug('Running startup step: ' + stepName);
    yield* waigo.load('support/startup/' + stepName)(App.app);
  }
};




/**
 * Stop the currently running application.
 *
 * This will reset the internal Koa `app` object.
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



