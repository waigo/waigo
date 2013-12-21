var _ = require('lodash'),
  koa = require('koa'),
  path = require('path'),
  Promise = require('bluebird'),
  mongoose = require('mongoose'),
  moment = require('moment'),
  views = require('co-views'),
  winston = require('winston'),
  waigo = GLOBAL.waigo;


/** Create the Express app object. */
var app = koa();




/**
 * Load in the application configuration.
 *
 * @return {Promise}
 * @private
 */
app._loadConfig = function() {
  return Promise.try(function() {
    app.config = waigo.load('config.index');
  });
};




/**
 * Setup logger.
 *
 * @return {Promise}
 * @private
 */
app._setupLogger = function() {
  return Promise.try(function() {
    var appLoggerType = _.keys(app.config.logging).pop();
    app.logger = waigo.load('support.logging.' + appLoggerType).create(app.config, app.config.logging[appLoggerType]);

    process.on('uncaughtException', function(err) {
      app.logger.error('Uncaught exception', err.stack);
    });

    app.on('error', function(err, ctx){
      app.logger.error(err);
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
  return Promise.try(function() {
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
  return Promise.try(function() {
    app.use(require('koa-response-time')());
    app.use(waigo.load('support.middleware.errorHandler')(app.config.errorHandlerConfig));
    app.use(waigo.load('support.middleware.rawBodySizeLimit')({ limitMb: app.config.uploadLimitMb }));

//    // sessions
//    var sessionConfig = app.config.session;
//    if (!sessionConfig.secret) {
//      throw new Error('Please specify a session secret in the app config file.');
//    }
//    app.use(express.cookieParser());
//    app.use(express.session({
//      secret: sessionConfig.secret,
//      store: waigo.load('support.session.store.' + sessionConfig.store.type).create(app, sessionConfig.store.config),
//      cookie: {
//        expires: moment().add('days', sessionConfig.cookie.validForDays).toDate(),
//        path: sessionConfig.cookie.path
//      }
//    }));

    app.use(require('koa-static')(path.join(waigo.getAppFolder(), app.config.staticFolder)));
    app.use(waigo.load('support.middleware.viewFormats')(app.config.viewFormats));
  });
};




/**
 * Setup routes and their handlers.
 *
 * @return {Promise}
 * @private
 */
app._setupRoutes = function() {
  return Promise.try(function() {
    app.routes = waigo.load('routes');
    app.controllers = waigo.load('support.routeMapper').map(app.routes);
    // apply all mappings
    _.each(app.controllers, function(mappings) {
      _.each(mappings, function(mapping) {
        app.use(mapping);
      });
    });
  });
};



/**
 * Start server.
 *
 * @return {Promise}
 * @private
 */
app._startServer = function() {
  return Promise.try(function() {
    app.listen(app.config.port);
    app.logger.info('Server listening on port ' + app.config.port);
  });
};




/**
 * Start the node.js server.
 *
 * All application should call into this starting point.
 *
 * @return {Promise}
 */
app.start = Promise.coroutine(function*() {
  yield app._loadConfig();
  yield app._setupLogger();
  yield app._setupDatabase();
  yield app._setupMiddleware();
  yield app._setupRoutes();
  yield app._startServer();
});



module.exports = app;