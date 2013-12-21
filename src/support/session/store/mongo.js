// TODO: work with koa-session-store

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
    storeConfig.mongoose_connection = app.db;
  }

  return new MongoStore(storeConfig);
};
