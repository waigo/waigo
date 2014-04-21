"use strict";


/**
 * Create a cookie session store.
 * 
 * @param app {Object} app.
 * @param storeConfig {Object} config.
 * 
 * @return {Object} Storage object.
 */
exports.create = function(app, storeConfig) {
  // koa-session-store automatically falls back to using the session cookie itself if no store object is given
  return null;
};
