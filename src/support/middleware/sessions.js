var koaSessionStore = require('koa-session-store');

/**
 * # Middleware: sessions
 *
 * **Note: this requires the `cookies` startup step to be enabled**
 * 
 * This middleware uses [koa-session-store](https://github.com/hiddentao/koa-session-store) to enable 
 * session data storage. 
 */



module.exports = function(options) {
  if (!options.keys) {
    throw new Error('Please specify cookie signing keys (session.keys) in the config file.');
  }

  return koaSessionStore({
    name: options.name,
    store: waigo.load('support/session/store/' + options.store.type).create(app, options.store.config),
    cookie: {
      expires: moment().add('days', options.cookie.validForDays).toDate(),
      path: options.cookie.path
    }
  });
};
