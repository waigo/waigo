/**
 * # Base configuration
 *
 * This is the base configuration module which gets loaded first by the [configuration loader](index.js.html).
 */


/**
 * Get configuration.
 * 
 * @param  {Object} config Configuration object to modify.
 */
module.exports = function(config) {

  /**
   * Server listening port.
   * @type {Number}
   */
  config.port = 3000;


  /**
   * Base web URL
   * @type {String}
   */
  config.baseURL = 'http://localhost:' + config.port;


  // ---------------------------
  // STARTUP
  // ---------------------------


  /**
   * Database connection.
   * @type {Object}
   */
  config.db = null;


  /**
   * Logging config.
   * @type {Object}
   */
  config.logging = {
    winston: {
      // log to console
      console: {
        level: 'error', // minimum level to log at
        colorize: true,
        timestamp: true
      }
    }
  };






  /**
   * The steps to execute as part of the application startup process.
   *
   * Each of these corresponds to a module file under the `startup/` route.
   * 
   * @type {Array}
   */
  config.startupSteps = [
    'logging',
    'middleware',
    'routes',
    'listener'
  ];




  // ---------------------------
  // MIDDLEWARE
  // ---------------------------


  /**
   * Session configuration.
   *
   * We don't provide default `keys` so as to encourage developers to provide a custom one for their app.
   *
   * @type {Object}
   */
  config.sessions = {
    // cookie signing keys - these are used for signing cookies (using Keygrip) and should be customised for your app
    keys: ['use', 'your', 'own'],
    // session cookie name
    name: 'waigo',
    // session storage
    store: {
      // session store type (name of module file in support/session/store/)
      type: 'cookie',
      // session store config
      config: {
        // nothing needed for cookie storage
      }
    },
    // session cookie options
    cookie: {
      // cookie expires in...
      validForDays: 7,
      // cookie valid for url path...
      path: '/'
    }
  };


  /**
   * Server responses to client requests can be in the formats specified here.
   * @type {Object}
   */
  config.outputFormats = {
    // List of enabled formats along with options to pass to each formatter. */
    formats: {
      html: {
        // Folder relative to application root folder, in which to look for view templates. */
        folder: 'views',
        // Default view template filename extension when not explicitly provided. */
        ext: 'jade',
        // Map file extension to rendering engine
        engine: {
          'jade': 'jade'
        }
      },
      json: {}
    },
    // Use this URL query parameter to determine output format. */
    paramName: 'format',
    // Default format, in case URL query parameter which determines output format isn't provided. */
    default: 'html'
  };





  /**
   * Static resources.
   * @type {Object}
   */
  config.staticResources = {
    // relative to app folder
    folder: '../public',
    // see support/middleware/staticResources for options
    options: {}
  };




  /**
   * Config for request error handler.
   * @type {Object}
   */
  config.errorHandler = {
    // whether to show stack traces in error output.
    showStack: false
  };



  /**
   * Middleware for all requests. 
   * @type {Array}
   */
  config.middleware = [
    {
      id: 'errorHandler',
      options: config.errorHandler
    },
    {
      id: 'staticResources',
      options: config.staticResources
    },
    {
      id: 'sessions',
      options: config.sessions
    },
    {
      id: 'outputFormats',
      options: config.outputFormats
    }
  ];


};


