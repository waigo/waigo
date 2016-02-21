"use strict";


const waigo = global.waigo,
  _ = waigo._;


/**
 * Setup middleware common to all requests.
 *
 * @param {Object} app The application.
 */
module.exports = function*(app) {
  app.logger.debug('Setting up common middleware');

  for (let m of app.config.middleware.ALL._order) {
    app.logger.debug(`Loading middleware: ${m}`);

    app.use(waigo.load(`support/middleware/${m}`)(
      _.get(app.config.middleware.ALL, m, {})
    ));
  }
};
