"use strict";


var koaSessionStore = require('koa-session-store'),
  moment = require('moment'),
  waigo = require('../../../');




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
 */
module.exports = function(options) {
  var app = waigo.load('application').app;

  if (!options.keys) {
    throw new Error('Please specify cookie signing keys in the config file.');
  }
  
  app.keys = options.keys;

  return koaSessionStore({
    name: options.name,
    store: waigo.load('support/session/store/' + options.store.type).create(app, options.store.config),
    cookie: {
      expires: moment().add('days', options.cookie.validForDays).toDate(),
      path: options.cookie.path,
      signed: false,
    }
  });
};
