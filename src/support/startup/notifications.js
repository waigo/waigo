

const co = require('co')

const waigo = global.waigo,
  _ = waigo._




/**
 * Setup notification mechanisms.
 *
 * Upon completion:
 * 
 * `App.emit('notify')` will trigger a notification.
 * 
 * @param {Object} App The application.
 */
module.exports = function *(App) {
  App.logger.info(`Setting up notifications`)

  const ids = _.keys(App.config.notifications || {})

  App.notifiers = {}

  for (const id of ids) {
    App.logger.debug(`Setting up notifier: ${id}`)

    const cfg = App.config.notifications[id]

    const transports = yield _.map(cfg.transports || [], function *(transport) {
      App.logger.debug(`Setting up transport: ${transport.type}`)

      const builder = waigo.load(`support/notifications/${transport.type}`)

      return yield builder(App, id, transport.config)
    })

    App.notifiers[id] = {
      transports: transports,
    }
  }

  App.on('notify', co.wrap(function *(id, messageOrObject) {
    if (!App.notifiers[id]) {
      return App.logger.warn(`Skipping invalid notifier target: ${id}`)
    }

    App.logger.debug(`Notify ${id}`)

    yield _.map(App.notifiers[id].transports, (t) => {
      return t(messageOrObject)
    })
  }))
}


