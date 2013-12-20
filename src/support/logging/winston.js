var _ = require('lodash'),
  winston = require('winston'),
  winstonMongoDB = require('winston-mongodb');


/**
 * Create a winston logger.
 *
 * @param appConfig {Object} general app configuration.
 * @param winstonConfig {Object} winston loggin configuration.
 *
 * @return {Object} winston logger.
 */
exports.create = function(appConfig, winstonConfig) {
  var winstonTransports = [];

  _.each(_.keys(winstonConfig), function(transportType) {
    var transport = null;

    switch (transportType) {
      case 'console':
        transport = new winston.transports.Console(winstonConfig[transportType]);
        break;
      case 'mongo':
        var mongoConfig = winstonConfig[transportType];

        mongoConfig.host = appConfig.db.mongoose.host;
        mongoConfig.db = appConfig.db.mongoose.db;

        transport = new winston.transports.MongoDB(mongoConfig);

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