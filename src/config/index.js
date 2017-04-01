const debug = require('debug')('waigo_config')

const waigo = global.waigo


/**
 * Load config module.
 * @param  {String} name Config module name.
 * @return {Function} `null` if module not found.
 */
const loadConfigModule = function (name) {
  try {
    debug(`Loading ${name} configuration`)

    return waigo.load(`config/${name}`)
  } catch (e) {
    debug(`Error loading config: ${name}`)
    debug(e)

    return null
  }
}




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
module.exports = function () {
  const config = {
    mode: process.env.NODE_ENV || 'development',
    user: process.env.USER
  }

  debug('Config mode, user', config.mode, config.user)

  // base
  let fn = loadConfigModule('base')
  if (!fn) {
    throw new Error('Base configuration file not found')
  }
  fn(config)


  // mode
  fn = loadConfigModule(config.mode)
  if (fn) {
    fn(config)
  }

  // mode.userId
  fn = loadConfigModule(config.mode + '.' + config.user)
  if (fn) {
    fn(config)
  }

  return config
}
