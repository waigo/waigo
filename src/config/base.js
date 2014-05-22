"use strict";


/**
 * # Base configuration
 * 
 * This is the base configuration for the application.
 * 
 * This configuration module file is mandatory and gets applied for all modes 
 * in which the application may run.
 * 
 * @param  {Object} config Configuration object to modify.
 */
module.exports = function(config) {

  /**
   * Server listening port.
   */
  config.port = 3000;


  /**
   * Base web URL
   */
  config.baseURL = 'http://localhost:' + config.port;



  /**
   * Database connection.
   */
  config.db = null;


  /**
   * Logging config.
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
   * Each of these corresponds to a module file under the `support/startup` path.
   */
  config.startupSteps = [
    'logging',
    'middleware',
    'routes',
    'listener'
  ];





  /**
   * Middleware for all requests. 
   *
   * Each `id` corresponds to a module file under the `support/middleware` path.
   */
  config.middleware = {
    order: [
      'errorHandler',
      'staticResources',
      'sessions',
      'outputFormats'
    ],
    options: {
      errorHandler: {
        // whether to show stack traces in error output.
        showStack: false
      },
      staticResources: {
        // relative to app folder
        folder: '../public',
        // see support/middleware/staticResources for options
        options: {}
      },
      sessions: {
        // cookie signing keys - these are used for signing cookies (using Keygrip) and should be customised for your app
        keys: ['use', 'your', 'own'],
        // session cookie name
        name: 'waigo',
        // session storage
        store: {
          // session store type (name of module file in `support/session/store`)
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
      },
      outputFormats: {
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
      }
    }
  };


};


