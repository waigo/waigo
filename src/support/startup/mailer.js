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

  app.logger.debug('Initializingm mailer: ' + mailerConfig.type);

  // load in the mailer implementation
  var mailer = waigo.load('support/mailers/' + mailerConfig.type);

  app.mailer = yield mailer.create(app, mailerConfig);
};


