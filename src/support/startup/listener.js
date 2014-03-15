"use strict";


var debug = require('debug')('waigo-startup-listener'),
  waigo = require('../../../');


/**
 * Start the server listener.
 *
 * @param {Object} app The application.
 */
module.exports = function*(app) {
  debug('Starting HTTP server');
  app.logger.info('Server listening in ' + app.config.mode + ' mode on port ' + app.config.port + ' (baseURL: ' + app.config.baseURL + ')');
  return app.listen(app.config.port);
};

