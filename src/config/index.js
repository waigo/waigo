/**
 * Return the config for current environment/mode and user
 */
var _ = require('lodash'),
  waigo = GLOBAL.waigo;


var config = waigo.load('config.base');


_.extend(config, {
  mode: process.env.NODE_ENV || 'development',
  user: process.env.USER
});


try {
  _.extend(config, waigo.load('config.' + config.mode));
} catch (e) {}

try {
  _.extend(config, waigo.load('config.' + config.mode + '.' + config.user));
} catch (e) {}



module.exports = config;