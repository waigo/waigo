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


const AppError = errors.define('AppError');


/** 
 * The application object is the main entry point for all Waigo applications.
 * 
 * It is responsible for constructing the Koa `app` object and initialising
 * logging, database connections, sessions and the various middleware
 * components amongst other things.
 *
 * Internally it holds a reference to the Koa `app` object.
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
   * @private
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
   * This gets called automatically from `start()` and should not be called 
   * directly.
   *
   * @param {Object} [options] Additional options.
   * @param {Function} [options.postConfig] Function to pass configuration object to once loaded. Useful for performing dynamic runtime configuration.
   * 
   * @private
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
   * Handler for errors.
   * 
   * @private
   */
  _onError (err) {
    this.logger.error(err.stack ? err.stack : err);
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
   *
   * @private
   */
  * _setupLogger (cfg) {
    debug('Setup logging');

    this.logger = logger.init(cfg);

    process.on('uncaughtException', this._onError);
    this.koa.on('error', this._onError);
    this.on('error', this._onError);
  }



  /**
   * Start the Koa application.
   *
   * This is a convenience method for initialising the various parts of the app and setting up the general middleware chain.
   *
   * @param {Object} [options] Additional options.
   * @param {Function} [options.postConfig] see `loadConfig()`.
   *
   * @public
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
   * Stop the currently running application.
   *
   * This will reset the internal Koa `app` object.
   *
   * @public
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




module.exports = Application;





