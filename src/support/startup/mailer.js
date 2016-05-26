"use strict";

const waigo = global.waigo,
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
  let mailerConfig = _.get(app.config, 'mailer', {});

  if (!_.get(mailerConfig, 'type')) {
    throw new Error('Mailer type not set');
  }

  app.logger.debug(`Initializing mailer: ${mailerConfig.type}`);

  let mailer = waigo.load(`support/mailer/${mailerConfig.type}`);

  app.mailer = yield mailer.create(app, mailerConfig);
};


