const waigo = global.waigo,
  logger = waigo.load('logger').create('LogNotifier')



module.exports = function *(App, id, config) {
  const _logger = logger.create(id)

  return function *(messageOrObject) {
    const msg = (typeof messageOrObject === 'string' ? messageOrObject : JSON.stringify(messageOrObject))

    _logger.info(msg)
  }
}
