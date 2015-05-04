"use strict";

var debug = require('debug')('waigo-startup-mailer');


var waigo = require('../../../'),
  _ = waigo._;



/**
 * Setup emailer system.
 *
 * Upon completion:
 * 
 * * `app.mailer` will be the emailer interface.
 * 
 * @param {Object} app The application.
 */
module.exports = function*(app) {
  var mailerConfig = app.config.mailer;

  // load in the mailer implementation
  var mailer = waigo.load('support/mailer/' + mailerConfig.type);

  app.logger.debug('Initializing mailer: ' + mailerConfig.type);

  app.mailer = yield mailer.create(app, mailerConfig);
};


