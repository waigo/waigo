const koaSessionStore = require('koa-session-store'),
  moment = require('moment')


const waigo = global.waigo,
  logger = waigo.load('logger').create('Middleware').create('Sessions')




/**
 * Build session middleware.
 *
 * This middleware uses [koa-session-store](https://github.com/hiddentao/koa-session-store)
 * to enable session data storage.
 *
 * @param {Object} options Configuration options.
 * @param {Array} options.keys Cookie signing keys for keygrip.
 * @param {String} options.name Session cookie name.
 * @param {Object} options.store Session store configuration.
 * @param {String} options.store.type Session store type.
 * @param {String} options.store.config Session store instance configuration.
 * @param {Object} options.cookie Session cookie options.
 * @param {Integer} options.cookie.validForDays No. of days cookie remains valid for.
 * @param {String} options.cookie.path Cookie path.
 * @param {Application} The active application instance.
 */
module.exports = function (App, options) {
  const { keys, name, store: { type, config }, cookie: { validForDays, path } } = options

  if (!keys) {
    throw new Error('Please specify cookie signing keys in the config file')
  }

  App.koa.keys = keys

  logger.info(`Initializing ${name} store of type ${type}`)

  return koaSessionStore({
    name: name,
    store: waigo.load(`sessions/${type}`)
                  .create(App, config),
    cookie: {
      expires: moment().add('days', validForDays).toDate(),
      path: path,
      signed: false,
    }
  })
}
