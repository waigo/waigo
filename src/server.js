var _ = require('lodash'),
  path = require('path'),
  express = require('express'),
  mongoose = require('mongoose'),
  Q = require('q'),
  moment = require('moment'),
  winston = require('winston'),
  waigo = GLOBAL.waigo;


/** Long stack traces. */
Q.longStackSupport = true;


/** Create the Express app object. */
var app = express();



/**
 * Load in the application configuration.
 *
 * @return {Promise}
 * @private
 */
app._loadConfig = function() {
  return Q.fcall(function() {
    app.config = waigo.load('config.index');
  });
};




/**
 * Setup logging.
 *
 * @return {Promise}
 * @private
 */
app._setupLogging = function() {
  return Q.fcall(function() {
    var appLoggerType = _.keys(app.config.logging).pop();
    app.logger = waigo.load('support.logging.' + appLoggerType).create(app.config, app.config.logging[appLoggerType]);

    process.on('uncaughtException', function(err) {
      app.logger.log('Uncaught exception', err, err.stack);
    });
  });
};




/**
 * Setup db connection.
 *
 * @return {Promise}
 * @private
 */
app._setupDatabase = function() {
  return Q.fcall(function() {
    var dbType = _.keys(app.config.db).pop();
    app.db = waigo.load('support.db.' + dbType).create(app.config.db[dbType]);
  });
};





/**
 * Setup Express middlewar.
 *
 * @return {Promise}
 * @private
 */
app._setupMiddleware = function() {
  return Q.fcall(function() {
    app.use(express.limit(app.config.uploadLimitMb + 'mb'));

    // sessions
    var sessionConfig = app.config.session;
    if (!sessionConfig.secret) {
      app.logger.warn('No session secret specified in app config. Using default null value.');
    }
    app.use(express.cookieParser());
    app.use(express.session({
      secret: sessionConfig.secret,
      store: waigo.load('support.session.store.' + sessionConfig.store.type).create(sessionConfig.store.config),
      cookie: {
        expires: moment().add('days', sessionConfig.cookie.validForDays).toDate(),
        path: sessionConfig.cookie.path
      }
    }));

    app.use(express.static(path.join(waigo.getAppFolder(), app.config.staticFolder)));
    app.use(app.router);
    app.use(waigo.load('support.errors').buildMiddleware(app.config.errorHandlerConfig));
  });
};



/**
 * Setup views and view rendering.
 *
 * @return {Promise}
 * @private
 */
app._setupViews = function() {
  return Q.fcall(function() {
    var viewConfig = app.config.views;

    app.set('views', path.join(waigo.getAppFolder(), viewConfig.folder));
    app.set('view engine', viewConfig.engine);
    app.set('view options', viewConfig.options);
  });
};




/**
 * Setup routes and their handlers.
 *
 * @return {Promise}
 * @private
 */
app._setupRoutes = function() {
  return Q.fcall(function() {
    // TODO
//    throw new Error('Not yet implemented!');
  });
};





/**
 * Start the node.js server.
 *
 * All application should call into this starting point.
 *
 * @return {Promise} resolves once startup is complete.
 */
app.start = function() {
  return Q()
    .then(app._loadConfig)
    .then(app._setupLogging)
    .then(app._setupDatabase)
    .then(app._setupMiddleware)
    .then(app._setupViews)
    .then(app._setupRoutes)
  ;
};



module.exports = app;