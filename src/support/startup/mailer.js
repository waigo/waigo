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
  var MailerClass = waigo.load('support/mailers/' + mailerConfig.type);

  

  app.


  app.dbs = {};

  var ids = _.keys(app.config.db || {});

  for (let i=0; ids.length > i; ++i) {
    let id = ids[i],
      cfg = app.config.db[id];

    app.logger.debug('Setting up database connection: ' + id);
    
    var builder = waigo.load('support/db/' + cfg.type);

    app.dbs[id] = yield builder.create(cfg);
  }

  // for convenience
  app.db = app.dbs.main;
};


