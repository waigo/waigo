"use strict";


var debug = require('debug')('waigo-application'),
  koa = require('koa'),
  log4js = require('log4js'),
  path = require('path'),
  Q = require('bluebird'),
  moment = require('moment'),
  waigo = require('../'),
  _ = waigo._;

// underscore mixins
_.mixin(waigo.load('support/lodashMixins'));



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
 * Setup application logger.
 *
 * The logging configuration is a key-value map where the key specifies the 
 * name of the module file under the `support.logging` path and the mapped 
 * value specifies the configuration for the specific logger type.
 * 
 * Upon completion `app.logger` will be set.
 *
 * _Note: At present only the first specified logger actually gets initialised_.
 * 
 * @param {Object} cfg Logger configuration.
 */
Application.setupLogger = function*(cfg) {
  var app = Application.app;
  
  debug('Setup logging');

  log4js.configure({
    appenders: cfg.appenders || [],
  });

  app.logger = log4js.getLogger(cfg.category);
  app.logger.setLevel(cfg.minLevel);

  process.on('uncaughtException', function(err) {
    app.logger.error('Uncaught exception', err.stack ? err.stack : err);
  });

  app.on('error', function(err, ctx){
    app.logger.error(err.stack ? err.stack : err);
  });

  // allow easy creation of other-category loggers
  app.logger.create = function(category) {
    var logger = log4js.getLogger(category);

    logger.setLevel(cfg.minLevel);

    return logger;
  };
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

  // logging
  /*jshint -W030 */
  yield* Application.setupLogger(Application.app.config.logging);

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
  // run shutdown steps
  var shutdownSteps = _.get(Application.app, 'config.shutdownSteps', []);
  for (let idx in shutdownSteps) {
    let stepName = shutdownSteps[idx];

    debug('Running shutdown step: ' + stepName);

    /*jshint -W030 */
    yield* waigo.load('support/shutdown/' + stepName)(Application.app);
  }

  // prepare the koa app for a restart
  debug('Resetting koa app');

  Application.app = koa();
};



