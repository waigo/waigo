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
var Application = module.exports = {
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
Application.loadConfig = function*(options) {
  options = options || {};

  debug('Loading configuration');
  Application.app.config = waigo.load('config/index')();

  if (options.postConfig) {
    debug('Executing dynamic configuration');
    options.postConfig.call(null, Application.app.config);
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
Application.start = function*(options) {
  // load config
  /*jshint -W030 */
  yield* Application.loadConfig(options);

  // setup timers management
  Application.app.timers = new waigo.load('support/timers');

  // run startup steps
  for (let idx in Application.app.config.startupSteps) {
    let stepName = Application.app.config.startupSteps[idx];
    debug('Running startup step: ' + stepName);
    /*jshint -W030 */
    yield* waigo.load('support/startup/' + stepName)(Application.app);
  }
};




/**
 * Stop the currently running application.
 *
 * This will reset the internal Koa `app` object.
 */
Application.shutdown = function*() {
  debug('Stopping timers');
  Application.app.timers.stop();

  if (Application.app.server) {
    debug('Shutting down HTTP server');
    yield Q.promisify(Application.app.server.close, Application.app.server)();
  } 

  // prepare the koa app for a restart
  debug('Resetting koa app');
  Application.app = koa();
};



