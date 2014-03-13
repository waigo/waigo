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
 * Application startup process steps.
 * @type {Array}
 * @private
 */
app._startup = [];



/** 
 * Add a step to the application start-up process.
 * @param {String}   id Unique id of startup step.
 * @param {Function} fn   Generator function representing this step.
 * @param {String} [afterId] Name of startup step after which to add this one. Of ommitted then this step 
 * will be added as the last step.
 */
app.addStartupStep = function(id, fn) {
  app._startup.push({
    id: id,
    fn: fn
  });
};





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
 * Setup logger.
 *
 * @protected
 */
app.setupLogger = function*() {
  var appLoggerType = _.keys(app.config.logging).pop();
  debug('Setting up logger: ' + appLoggerType);
  app.logger = waigo.load('support/logging/' + appLoggerType).create(app.config.logging[appLoggerType]);

  process.on('uncaughtException', function(err) {
    app.logger.error('Uncaught exception', err.stack);
  });

  app.on('error', function(err, ctx){
    app.logger.error(err.stack);
  });
};




/**
 * Setup database connection.
 *
 * @protected
 */
app.setupDatabase = function*() {
  if (app.config.db) {
    var dbType = _.keys(app.config.db).pop();
    debug('Setting up database connection : ' + dbType);
    app.db = waigo.load('support/db/' + dbType).create(app.config.db[dbType]);
  }
};




/**
 * Setup middleware chain for all requests.
 *
 * @protected
 */
app.setupMiddleware = function*() {
  _.each(app.config.middleware, function(m) {
    debug('Setting up middleware: ' + m.id);
    app.use(waigo.load('support/middleware/' + m.id)(m.options));
  });
};





/**
 * Setup keys for cookie signing by keygrip.
 *
 * @protected
 */
app.setupKeygripKeys = function*() {
  app.keys = app.config.keygrip.keys;
};






/**
 * Setup routes and router middleware.
 *
 * @protected
 */
app.setupRoutes = function*() {
  debug('Setting up routes');
  require('koa-trie-router')(app);
  app.routes = waigo.load('routes');
  waigo.load('support/routeMapper').map(app, app.routes);
  app.use(app.router);
};



/**
 * Start the HTTP server.
 *
 * @return {Object} The result of the call to `app.listen()`.
 * @protected
 */
app.startServer = function*() {
  debug('Starting HTTP server');
  app.logger.info('Server listening in ' + app.config.mode + ' mode on port ' + app.config.port + ' (baseURL: ' + app.config.baseURL + ')');
  return app.listen(app.config.port);
};



/**
 * Application startup-steps.
 *
 * This lists the functions to execute when starting the application.
 * 
 * @type {Array}
 * @protected
 */
app.startupSteps = [
  app.loadConfig,
  app.setupLogger,
  app.setupDatabase,
  app.setupMiddleware,
  app.setupKeygripKeys,
  app.setupRoutes,
  app.startServer
];



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
  yield* app.setupLogger();
  yield* app.setupDatabase();

  // middleware chain for every incoming request
  yield* app.setupMiddleware();
  yield* app.setupKeygripKeys();

  yield* app.setupRoutes();
  return yield* app.startServer();    
};

