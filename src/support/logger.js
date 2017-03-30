

const log4js = require('log4js')

const config = {
  minLevel: 'DEBUG',
}


exports.init = function (cfg) {
  config = cfg

  log4js.configure({
    appenders: config.appenders || [],
  })

  const logger = log4js.getLogger(config.category)

  logger.setLevel(config.minLevel)

  logger.create = exports.create

  return logger
}



exports.create = function (category) {
  const logger = log4js.getLogger(category)

  logger.setLevel(config.minLevel)

  // Allow for easy creation of sub-categories.
  logger.create = function (subCategory) {
      return exports.create(`${category}/${subCategory}`)
  }

  return logger
}



