"use strict";


var mongoStore = require('koa-session-mongo');

/**
 * Create a new session store.
 * @param app {Object} app.
 * @param storeConfig {Object} config.
 * @return {Object}
 */
exports.create = function(app, storeConfig) {
  // re-use the app mongoose db connection?
  if (storeConfig.useAppMongooseDbConn) {
    app.logger.info('Session store will use app Mongoose db connection');
    storeConfig.mongoose = app.db;
  }

  return mongoStore.create(storeConfig);
};
