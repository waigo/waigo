var _ = require('lodash'),
  winston = require('winston'),
  winstonMongoDB = require('winston-mongodb');


/**
 * Create a winston logger.
 *
 * @param winstonConfig {Object} winston loggin configuration.
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
      case 'mongo':
        transport = new winston.transports.MongoDB(winstonConfig[transportType]);

        transport.on('error', function(err) {
          console.log('Winston failed to log message to MongoDB', err);
        });
    }

    if (transport) winstonTransports.push(transport);
  });

  // setup logger
  var logger = new (winston.Logger)({
    transports: winstonTransports
  });

  return logger;
};