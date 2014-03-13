var waigo = require('../../../');


/**
 * Load in application configuration.
 *
 * @param {Object} app The application.
 */
module.exports = function*(app) {
  app.config = waigo.load('config/index')();
};
