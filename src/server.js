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
require('koa-trie-router')(app);



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
    app.logger.error(err);
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
 * Setup middleware for generating X-Response-Time headers.
 *
 * @protected
 */
app.setupResponseTime = function*() {
  debug('Setting up X-Response-Time middleware');
  app.use(waigo.load('support/middleware/responseTime')());
};



/**
 * Setup middleware for dealing with errors.
 *
 * @protected
 */
app.setupErrorHandler = function*() {
  debug('Setting up error handler middleware');
  app.use(waigo.load('support/middleware/errorHandler')(app.config.errorHandler));
};




/**
 * Setup middleware for handling user sessions.
 *
 * @protected
 */
app.setupSessions = function*() {
  var sessionConfig = app.config.session;
  if (sessionConfig) {
    if (!sessionConfig.keys) {
      throw new Error('Please specify cookie signing keys (session.keys) in the config file.');
    }

    debug('Setting up sessions');

    app.keys = sessionConfig.keys;
    app.use(waigo.load('support/middleware/sessions')({
      name: sessionConfig.name,
      store: waigo.load('support/session/store/' + sessionConfig.store.type).create(app, sessionConfig.store.config),
      cookie: {
        expires: moment().add('days', sessionConfig.cookie.validForDays).toDate(),
        path: sessionConfig.cookie.path
      }
    }));
  }
};




/**
 * Setup middleware for serving static resources.
 *
 * @protected
 */
app.setupStaticResources = function*() {
  debug('Setting up static resources');
  app.use(waigo.load('support/middleware/staticResources')(app.config.staticResources));
};




/**
 * Setup middleware for response output formats.
 *
 * @protected
 */
app.setupOutputFormats = function*() {
  debug('Setting up output formats');
  app.use(waigo.load('support/middleware/outputFormats')(app.config.outputFormats));
};





/**
 * Setup routes and router middleware.
 *
 * @protected
 */
app.setupRoutes = function*() {
  debug('Setting up routes');
  app.routes = waigo.load('routes');
  waigo.load('support/routeMapper').map(app, app.routes);
  app.use(app.router);
};



/**
 * Start the HTTP server.
 *
 * @protected
 */
app.startServer = function*() {
  debug('Starting HTTP server');
  app.listen(app.config.port);
  app.logger.info('Server listening in ' + app.config.mode + ' mode on port ' + app.config.port + ' (baseURL: ' + app.config.baseURL + ')');
};




/**
 * Start the Koa application.
 *
 * This is a convenience method for initialising the various parts of the app and setting up the general middleware chain.
 *
 * @public
 */
app.start = function*() {
  yield* app.loadConfig();
  yield* app.setupLogger();
  yield* app.setupDatabase();

  // middleware chain for every incoming request
  yield* app.setupResponseTime();
  yield* app.setupErrorHandler();
  yield* app.setupStaticResources();
  yield* app.setupSessions();
  yield* app.setupOutputFormats();

  yield* app.setupRoutes();
  yield* app.startServer();    
};

