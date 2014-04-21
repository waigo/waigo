"use strict";


var _ = require('lodash'),
  winston = require('winston');

/**
 * Create a winston logger instance.
 *
 * The configuration object specifies the transports to initialise as well as 
 * their configuration options. At present only the 
 * [console](https://github.com/flatiron/winston/blob/master/docs/transports.md#console-transport) 
 * transport is supported. 
 * 
 * @param winstonConfig {Object} winston logging configuration.
 *
 * @return {Object} winston logger.
 */
exports.create = function(winstonConfig) {
  var winstonTransports = [];

  _.each(_.keys(winstonConfig), function(transportType) {
    var transport = null;

    switch (transportType) {
      case 'console':
        transport = new winston.transports.Console(winstonConfig[transportType]);
        break;
    }

    if (transport) {
      winstonTransports.push(transport);
    }
  });

  // setup logger
  var logger = new (winston.Logger)({
    transports: winstonTransports
  });

  return logger;
};