var express = require('express'),
  MongoStore = require('connect-mongo')(express);


/**
 * Create a new session store.
 * @param storeConfig {Object} config.
 * @return {Object}
 */
exports.create = function(storeConfig) {
  return new MongoStore({
    url: storeConfig.url
  });
};
