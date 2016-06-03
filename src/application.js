"use strict";


const debug = require('debug')('waigo_application'),
  koa = require('koa'),
  log4js = require('log4js'),
  EventEmitter = require('eventemitter3'),
  path = require('path');


const waigo = global.waigo,
  _ = waigo._,
  logger = waigo.load('support/logger'),
  errors = waigo.load('support/errors');


// underscore mixins
waigo.load('support/lodashMixins')(_);


const ShutdownError = errors.define('ShutdownError');



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
  let app = Application.app;
  
  debug('Setup logging');

  app.logger = logger.init(cfg);

  app.onUncaughtException = function(err) {
    app.logger.error('Uncaught exception', err.stack ? err.stack : err);
  };

  process.on('uncaughtException', app.onUncaughtException);

  app.on('error', function(err, ctx){
    app.logger.error(err.stack ? err.stack : err);
  });
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
  yield Application.loadConfig(options);

  // logging
  /*jshint -W030 */
  yield Application.setupLogger(Application.app.config.logging);

  // run startup steps
  let app = Application.app;

  // setup events
  app.events = new EventEmitter();

  for (let stepName of app.config.startupSteps) {
    app.logger.debug(`Running startup step: ${stepName}`);
    
    /*jshint -W030 */
    yield waigo.load(`support/startup/${stepName}`)(Application.app);
  }

  app.logger.info('Startup complete');
};




/**
 * Stop the currently running application.
 *
 * This will reset the internal Koa `app` object.
 */
Application.shutdown = function*() {
  let app = Application.app;

  if (!_.get(app.config, 'shutdownSteps')) {
    throw new ShutdownError('Application not started');
  }

  // remove uncaught exception handler
  process.removeListener('uncaughtException', app.onUncaughtException);

  // run shutdown steps
  for (let stepName of app.config.shutdownSteps) {
    app.logger.debug(`Running shutdown step: ${stepName}`);

    /*jshint -W030 */
    yield waigo.load(`support/shutdown/${stepName}`)(Application.app);
  }

  app.logger.info('Shutdown complete');

  // prepare the koa app for a restart
  Application.app = koa();
};



