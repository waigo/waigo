"use strict";


var _ = require('lodash'),
  waigo = require('../../');


/**
 * # Configuration loader
 *
 * This loads the application configuration.
 *
 * The [base configuration](base.js.html) module gets loaded first. Additional
 * configuration modules then get loaded using the following logic:
 *
 * 1. `config/<node environment>` 
 * 2. `config/<node environment>.<current user>`
 *
 * Thus if node is running in `test` mode and the user id of the process is
 * `www-data` then this looks for the following module files and loads them if
 * present, in the following order:
 *
 * 1. `config/test`
 * 2. `config/test.www-data`
 *
 * The current configuration object gets passed to each subsequently loaded
 * configuration module file.
 * @return {Object}
 */
module.exports = function() {
  var config = {
    mode: process.env.NODE_ENV || 'development',
    user: process.env.USER
  };

  waigo.load('config/base')(config);

  try {
    waigo.load('config/' + config.mode)(config);
  } catch (e) {}

  try {
    waigo.load('config/' + config.mode + '.' + config.user)(config);
  } catch (e) {}


  return config;
};




