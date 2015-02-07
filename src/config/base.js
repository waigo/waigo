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
   * Logging config (log4js-node).
   *
   * See [https://github.com/nomiddlename/log4js-node/wiki/Appenders](log4j docs) for config options.
   */
  config.logging = {
    // default logging category
    category: 'app',
    // minimum logging level
    minLevel: 'ERROR',
    // where logging output should go
    appenders: [
      {
        type: 'console',
        layout: 'coloured'
      }
    ],
  };


  /**
   * Static resources folder (relative to app folder)
   */
  config.staticResources = {
    folder: '../public'
  };


  /**
   * The steps to execute as part of the application startup process.
   *
   * Each of these corresponds to a module file under the `support/startup` path.
   */
  config.startupSteps = [
    'staticResources',
    'database',
    'models',
    'middleware',
    'routes',
    'listener'
  ];



  /**
   * The steps to execute as part of the application shutdown process.
   *
   * Each of these corresponds to a module file under the `support/shutdown` path.
   */
  config.shutdownSteps = [
    'listener',
    'database',
  ];


  /**
   * Database connection.
   *
   * You can specify multiple database connections as long as `main` connection
   * is also always specified. The built-in model classes will store their data 
   * in this connection.
   */
  config.db = {
    // connection id
    main: {
      // currently supported: mongo
      type: 'mongo',
      // name of db
      name: 'waigo',
      // host/replica sets
      hosts: [
        // first entry is always treated as the master
        {
          host: '127.0.0.1',
          port: 27017,
        }
      ],
    }
  };



  /**
   * Middleware for all requests. 
   *
   * Each `id` corresponds to a module file under the `support/middleware` path.
   */
  config.middleware = {
    // the order in which middleware gets execured
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
        folder: config.staticResources.folder,
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
            // Default view template filename extension when not explicitly provided. */
            ext: 'jade',
            // Whether compiled templates should be cached in memory (not all template engines honour this)
            cache: true,
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


