var koaSessionStore = require('koa-session-store');

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
