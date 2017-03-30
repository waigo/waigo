

const waigo = global.waigo,
  _ = waigo._;



/**
 * Setup emailer system.
 *
 * Upon completion:
 * 
 * * `App.mailer` will be the emailer interface.
 * 
 * @param {Object} App The application.
 */
module.exports = function*(App) {
  let mailerConfig = _.get(App.config, 'mailer', {});

  if (!_.get(mailerConfig, 'type')) {
    throw new Error('Mailer type not set');
  }

  App.logger.debug(`Initializing mailer: ${mailerConfig.type}`);

  let mailer = waigo.load(`support/mailer/${mailerConfig.type}`);

  App.mailer = yield mailer.create(App, mailerConfig);
};


