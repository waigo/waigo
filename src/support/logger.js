"use strict";

const log4js = require('log4js');


exports.init = function(cfg) {
  log4js.configure({
    appenders: cfg.appenders || [],
  });

  let logger = log4js.getLogger(cfg.category);

  logger.setLevel(cfg.minLevel);

  logger.create = exports.create;

  return logger;
};



exports.create = function(category) {
  let logger = log4js.getLogger(category);

  // Allow for easy creation of sub-categories.
  logger.create = function(subCategory) {
      return exports.create(`${category}/${subCategory}`);
  }

  return logger;
};



