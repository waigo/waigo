var _ = require('lodash'),
  koa = require('koa'),
  path = require('path'),
  Promise = require('bluebird'),
  mongoose = require('mongoose'),
  moment = require('moment'),
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

    app.use(waigo.load('support.middleware.rawBodySizeLimit')({
      limitMb: app.config.uploadLimitMb
    }));

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

    app.use(require('koa-static')(path.join(waigo.getAppFolder(), app.config.staticFolder)))

    app.use(waigo.load('support.middleware.outputFormats')(app.config.outputFormats));
//    app.use(app.router);
//    app.use(waigo.load('support.errors').buildMiddleware(app.config.errorHandlerConfig));
  });
};



/**
 * Setup views and view rendering.
 *
 * @return {Promise}
 * @private
 */
app._setupViews = function() {
  return Promise.try(function() {
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
  return Promise.try(function() {
    app.routes = waigo.load('routes');
    app.controllers = [];

    _.each(app.routes, function(route) {
      // load the module
      route = _.extend({
        controller: 'controllers.main',
        paths: {
          '/': {
            httpMethod: 'get',
            method: 'index'
          }
        },
        viewFolder: ''
      }, route);

      // instantiate the controller
      var controller = new (waigo.load(route.controller).Controller)(app, route.viewFolder);
      controller.map(route.paths);
      app.controllers.push(controller);
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
//  yield app._setupDatabase();
//  yield app._setupViews();
//  yield app._setupMiddleware();
//  yield app._setupRoutes();
//  yield app._startServer();
});



module.exports = app;