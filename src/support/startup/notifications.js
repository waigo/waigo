"use strict";

const co = require('co');

const waigo = global.waigo,
  _ = waigo._;




/**
 * Setup notification mechanisms.
 *
 * Upon completion:
 * 
 * * `app.notify` will be callable when you wish to do notification
 * 
 * @param {Object} app The application.
 */
module.exports = function*(app) {
  app.logger.info(`Setting up notifications`);

  let ids = _.keys(app.config.notifications || {});

  app.notifiers = {};

  for (let id of ids) {
    app.logger.debug(`Setting up notifier: ${id}`);

    let cfg = app.config.notifications[id];

    let transports = yield _.map(cfg.transports || [], function*(transport) {
      app.logger.debug(`Setting up transport: ${transport.type}`);

      let builder = waigo.load(`support/notifications/${transport.type}`);

      return yield builder(app, id, transport.config);
    });

    app.notifiers[id] = {
      transports: transports,
    };
  }

  app.events.on('notify', co.wrap(function*(id, messageOrObject) {
    if (!app.notifiers[id]) {
      return app.logger.warn(`Skipping invalid notifier target: ${id}`);
    }

    app.logger.debug(`Notify ${id}`);

    yield _.map(app.notifiers[id].transports, (t) => {
      return t(messageOrObject);
    });
  }));
};


