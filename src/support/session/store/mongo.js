"use strict";


var debug = require('debug')('waigo-session-store-mongo'),
  mongoStore = require('koa-session-mongo');



/**
 * Create a new session store.
 * @param app {Object} app.
 * @param storeConfig {Object} config.
 * @return {Object}
 */
exports.create = function(app, storeConfig) {
  debug('Initialising Mongo session store...');
  
  // re-use the app mongoose db connection?
  if (storeConfig.useAppMongooseDbConn) {
    app.logger.info('Session store will re-use app Mongoose db connection');
    storeConfig.mongoose = app.db;
  }

  return mongoStore.create(storeConfig);
};
