var _ = require('lodash'),
  waigo = require('../../');

/**
 * # Configuration loader
 *
 * This module is responsible for loading in application configuration from the `config/` folder.
 */



/**
 * Load application configuration.
 * 
 * The [base configuration](base.js.html) module gets loaded first. Additional configuration modules 
 * then get loaded using the following logic:
 *
 * 1. `config/<node environment>`
 * 1. `config/<node environment>.<current user>`
 *
 * Thus if node is running in `test` mode (i.e. `NODE_ENVIRONMENT=test`) and the user id of the process is `www-data` then the loader 
 * looks for the following modules and loads them if present, in the following order:
 *
 * 1. [`config/test`](test.js.html)
 * 1. `config/test.www-data`
 *
 * The current configuration object gets _extended_ with the configuration object from each subsequently loaded module. This means 
 * that in each additional configuration file you only need to override the configuration properties that are different.
 * 
 * @return {Object}
 */
module.exports = function() {
  var config = _.extend({}, waigo.load('config/base'));

  _.extend(config, {
    mode: process.env.NODE_ENV || 'development',
    user: process.env.USER
  });

  try {
    waigo.load('config/' + config.mode)(config);
  } catch (e) {}

  try {
    waigo.load('config/' + config.mode + '.' + config.user)(config);
  } catch (e) {}


  return config;
};




