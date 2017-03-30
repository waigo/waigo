
/**
 * @file The default entry point for Waigo.
 */

const co = require('co')
const waigo = module.exports = require('./loader')


/**
 * Bootstrap the application.
 *
 * @return {Function} Function to start the app and which returns a `Promise`.
 */
waigo._bootstrap = function () {
  return co(function *() {
    /*
    Initialise the framework.

    If you need to override the application source folder and/or plugins to
    be loaded then this is the place to do it.

     */
    yield waigo.init()

    /*
    Start the application.

    This loads in application configuration, runs all startup steps, sets up
    the middleware and kicks off the HTTP listener.
     */
    waigo.App = new (waigo.load('application'))()

    yield waigo.App.start()
  })
}
