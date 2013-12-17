var _ = require('lodash'),
  express = require('express'),
  mongoose = require('mongoose'),
  Q = require('q'),
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
};



module.exports = app;