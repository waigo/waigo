



const waigo = global.waigo,
  _ = waigo._





/**
 * Setup route mappings.
 *
 * This sets up a `koa-trie-router` and maps routes to it using the 
 * [route mapper](../routeMapper.js.html).
 * 
 * @param {Object} App The application.
 */
module.exports = function *(App) {
  App.logger.debug('Setting up routes')

  const routeFiles = waigo.getItemsInFolder('routes')

  const routes = {}

  _.each(routeFiles, function (routeFile) {
    App.logger.debug('Loading ' + routeFile)

    _.merge(routes, waigo.load(routeFile))
  })

  App.routes = yield waigo.load('support/routeMapper')
    .setup(App, App.config.middleware, routes)
}




