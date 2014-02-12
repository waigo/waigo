var _ = require('lodash'),
  koa = require('koa'),
  path = require('path'),
  Promise = require('bluebird'),
  mongoose = require('mongoose'),
  moment = require('moment'),
  session = require('koa-session-store'),
  views = require('co-views'),
  winston = require('winston'),
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
 * Load in the application configuration.
 *
 * @return {Promise}
 * @protected
 */
app.loadConfig = function() {
  return Promise.try(function() {
    app.config = waigo.load('config/index');
  });
};




/**
 * Setup logger.
 *
 * @return {Promise}
 * @protected
 */
app.setupLogger = function() {
  return Promise.try(function() {
    var appLoggerType = _.keys(app.config.logging).pop();
    app.logger = waigo.load('support/logging/' + appLoggerType).create(app.config, app.config.logging[appLoggerType]);

    process.on('uncaughtException', function(err) {
      app.logger.error('Uncaught exception', err.stack);
    });

    app.on('error', function(err, ctx){
      app.logger.error(err);
    });
  });
};




/**
 * Setup database connection.
 *
 * @return {Promise}
 * @protected
 */
app.setupDatabase = function() {
  return Promise.try(function() {
    if (app.config.db) {
      var dbType = _.keys(app.config.db).pop();
      app.db = waigo.load('support/db/' + dbType).create(app.config.db[dbType]);
    }
  });
};





/**
 * Setup general request middleware that will apply to all incoming requests.
 *
 * @return {Promise}
 * @protected
 */
app.setupMiddleware = function() {
  return Promise.try(function() {
    app.use(require('koa-response-time')());
    app.use(waigo.load('support/middleware/errorHandler')(app.config.errorHandlerConfig));

    // sessions
    var sessionConfig = app.config.session;
    if (sessionConfig) {
      if (!sessionConfig.keys) {
        throw new Error('Please specify cookie signing keys (session.keys) in the config file.');
      }
      app.keys = sessionConfig.keys;
      app.use(session({
        name: sessionConfig.name,
        store: waigo.load('support/session/store/' + sessionConfig.store.type).create(app, sessionConfig.store.config),
        cookie: {
          expires: moment().add('days', sessionConfig.cookie.validForDays).toDate(),
          path: sessionConfig.cookie.path
        }
      }));
    }

    app.use(require('koa-static')(path.join(waigo.getAppFolder(), app.config.staticFolder)));
    app.use(waigo.load('support/middleware/viewFormats')(app.config.viewFormats));
  });
};




/**
 * Setup routes and router middleware.
 *
 * @return {Promise}
 * @protected
 */
app.setupRoutes = function() {
  return Promise.try(function() {
    app.routes = waigo.load('routes');
    waigo.load('support/routeMapper').map(app, app.routes);
    app.use(app.router);
  });
};



/**
 * Start the HTTP server.
 *
 * @return {Promise}
 * @protected
 */
app.startServer = function() {
  return Promise.try(function() {
    app.listen(app.config.port);
    app.logger.info('Server listening on port ' + app.config.port);
  });
};




/**
 * Start the Koa application.
 *
 * This is a convenience method for initialising the various application parts.
 *
 * @return {Promise}
 * @public
 */
app.start = function() {
  return Promise.spawn(function() {
    yield app.loadConfig();
    yield app.setupLogger();
    yield app.setupDatabase();
    yield app.setupMiddleware();
    yield app.setupRoutes();
    yield app.startServer();
  });
};

