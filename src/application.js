"use strict";
/**
 * @file
 * The Waigo application object.
 */

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


const AppError = errors.define('AppError');


/** 
 * The application object.
 * 
 * This is the main entry point for all Waigo applications. It is responsible 
 * for constructing the Koa `app` object, loading in the app 
 * configuration, initialising logging and running all startup steps.
 */
class Application extends EventEmitter {
  constructor () {
    super();

    this._initKoa();

    this._onError = this._onError.bind(this);
  }


  /**
   * Initialize koa.
   *
   * @protected
   */
  _initKoa () {
    var self = this;

    this.koa = koa();

    /**
     * Default middleware!
     */
    this.koa.use(function*(next) {
      this.App = self;

      yield next;
    });
  }



  /**
   * Load in the application configuration.
   *
   * This gets called automatically during startup.
   *
   * @param {Object} [options] Additional options.
   * @param {Function} [options.postConfig] Function to pass configuration object to once loaded.
   * Should have signature `function (config: Object)`.
   * 
   * @protected
   */
  * _loadConfig (options) {
    options = options || {};

    debug('Loading configuration');

    this.config = waigo.load('config/index')();

    if (options.postConfig) {
      debug('Executing dynamic configuration');

      options.postConfig.call(null, this.config);
    }
  }


  /**
   * Handle an error.
   *
   * @param {Error} err The error.
   * 
   * @protected
   */
  _onError (err) {
    this.logger.error(err.stack ? err.stack : err);
  };



  /**
   * Setup application logger.
   *
   * Upon completion `this.logger` will be set.
   *
   * @param {Object} cfg Logger configuration.
   *
   * @see support/logger.js
   * @protected
   */
  * _setupLogger (cfg) {
    debug('Setup logging');

    this.logger = logger.init(cfg);

    process.on('uncaughtException', this._onError);
    this.koa.on('error', this._onError);
    this.on('error', this._onError);
  }



  /**
   * Start the application.
   *
   * @param {Object} [options] Additional options.
   * @param {Function} [options.postConfig] Function to pass configuration object to once loaded.
   * Should have signature `function (config: Object)`.
   */
  * start (options) {
    if (this.config) {
      throw new AppError('Application already started');
    }

    // load config
    yield this._loadConfig(options);

    // logging
    yield this._setupLogger(this.config.logging);

    for (let stepName of this.config.startupSteps) {
      this.logger.debug(`Running startup step: ${stepName}`);
      
      /*jshint -W030 */
      yield waigo.load(`support/startup/${stepName}`)(this);
    }

    this.logger.info('Startup complete');
  }



  /**
   * Stop the application.
   *
   * This will reset the internal Koa `app` object.
   */
  * shutdown () {
    if (!this.config) {
      throw new AppError('Application not started');
    }

    // remove uncaught exception handler
    process.removeListener('uncaughtException', this._onError);

    // run shutdown steps
    for (let stepName of this.config.shutdownSteps) {
      this.logger.debug(`Running shutdown step: ${stepName}`);

      /*jshint -W030 */
      yield waigo.load(`support/shutdown/${stepName}`)(this);
    }

    this.logger.info('Shutdown complete');

    delete this.config;

    // reset koa
    this._initKoa();
  };


}



/**
 * @type {Class}
 */
module.exports = Application;





