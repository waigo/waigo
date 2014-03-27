var koaSessionStore = require('koa-session-store'),
  moment = require('moment'),
  waigo = require('../../../');


/**
 * # Middleware: sessions
 *
 * This middleware uses [koa-session-store](https://github.com/hiddentao/koa-session-store) to enable 
 * session data storage. 
 */



module.exports = function(options) {
  // this should get the current app
  var app = waigo.load('application').app;

  if (!options.keys) {
    throw new Error('Please specify cookie signing keys (session.keys) in the config file.');
  }
  app.keys = options.keys;

  return koaSessionStore({
    name: options.name,
    store: waigo.load('support/session/store/' + options.store.type).create(app, options.store.config),
    cookie: {
      expires: moment().add('days', options.cookie.validForDays).toDate(),
      path: options.cookie.path
    }
  });
};
