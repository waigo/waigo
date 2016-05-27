"use strict";

const cluster = require('cluster');

const waigo = global.waigo,
  _ = waigo._;



/**
 * # Base configuration
 * 
 * This is the base configuration for Waigo applications and is always loaded 
 * before any environment-specific configuration files.
 * 
 * This configuration module file is designed for running an app in a 
 * development environment and contains all the default available config 
 * options in Waigo.
 *
 * For production-quality deployments it is recommended you create a 
 * `production.js` config file and set the `NODE_ENV` environment variable to 
 * equal `production`.
 * 
 * @param {Object} config config Initial configuration object.
 */
module.exports = function(config) {
  /**
   * Server listening port.
   */
  config.port = (process.env.PORT || 3000);


  /**
   * Base web URL without the trailing slash
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
    minLevel: 'DEBUG',
    // where logging output should go
    appenders: [
      {
        type: 'console',
        layout: {
          type: 'pattern',
          pattern: '(%h-%z) %[[%d] [%p] [%c]%] - %m',
          tokens: {
            workerId: _.get(cluster, 'worker.id', 0)
          }
        }
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
    'db',
    'models',
    'forms',
    'activityRecorder',
    'notifications',
    'acl',
    'middleware',
    'routes',
    'staticResources',
    'actionTokens',
    'mailer',
    'cron',
    'appTemplateVars',
    'listener',
  ];



  /**
   * The steps to execute as part of the application shutdown process.
   *
   * Each of these corresponds to a module file under the `support/shutdown` path.
   */
  config.shutdownSteps = [
    'listener',
    'cron',
    'acl',
    'db',
  ];


  /** 
   * Error handling config.
   */
  config.errors = {
    /** 
     * Whether stack traces should be included when rendering errors.
     * @type {Boolean}
     */
    showStack: true,
  };



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
      // currently supported: rethinkdb
      type: 'rethinkdb',
      serverConfig: {
        // name of db
        db: 'waigo',
        // servers to connect to
        servers: [
          {
            host: '127.0.0.1',
            port: 28015,
          }
        ],
      }
    }
  };
  
   
   


  /**
   * Common middleware for requests. 
   */

  config.middleware = {};

  config.middleware.ALL = {
    _order: [
      'errorHandler',
      'staticResources',
      'sessions',
      'outputFormats',
      'currentUser',
      'contextHelpers',
      'csrf',
    ],
    errorHandler: {},
    staticResources: {
      // relative to app folder
      folder: config.staticResources.folder,
      // see support/middleware/staticResources for options
      options: {}
    },
    sessions: {
      // cookie signing keys
      keys: [
        _.uuid.v4(),
        _.uuid.v4(),
        _.uuid.v4(),
      ],
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
          ext: 'pug',
          // Whether compiled templates should be cached in memory (not all template engines honour this)
          cache: false,
          // Map file extension to rendering engine
          engine: {
            'pug': 'pug',
          }
        },
        json: {}
      },
      // Use this URL query parameter to determine output format. */
      paramName: 'format',
      // Default format, in case URL query parameter which determines output format isn't provided. */
      default: 'html'
    }
  };

  // POST/PUT routes should get parsed request bodies
  config.middleware.POST = config.middleware.PUT = {
    _order: [
      'bodyParser',
      'csrf',
    ],
    bodyParser: {
      limit: '16mb',
    },
  };




  /**
   * Mailer config.
   */
  config.mailer = {
    // default 'from' address
    from: 'System <waigo@localhost>',
    type: 'console',

    // type: 'smtp',
    // smtp: {
    //   host: '127.0.0.1',
    //   port: 25,
    //   secure: false,
    //   ignoreTLS: true,
    //   tls: {
    //     rejectUnauthorized: false
    //   },
    //   maxConnections: 1,
    //   maxMessages: 100,
    //   connectionTimeout: 3000,
    //   greetingTimeout: 3000,
    //   socketTimeout: 3000,
    //   debug: false,
    // }
  };


  /**
   * Action tokens are enrypted one-time strings sent to users (usually in a 
   * link by email) which represent a particular action to be taken at a future
   * point in time. 
   * 
   * The next time the server recieves the token it can decode it to find out 
   * what action should be taken for the associated user. 
   * 
   * Resetting a user's password is done using action tokens.
   */
  config.actionTokens = {
    // encryption key to prevent tampering 
    encryptionKey: _.uuid.v4(),
    // default token validity duration from when it was created
    validForSeconds: 60 * 60 * 2, /* 2 hours */
  };



  /**
   * Notificatiers are mechanisms through which notifications can be sent.
   */
  config.notifications = {
    // the key is the name of the notifier
    admins: {
      // one more notification transports
      transports: [
        {
          type: 'log',
        },
        /*
        {
          // Slack
          type: 'slack',
          // Notification config
          config: {
            url: slack url,
            channel: channel name,
            username: username to show in slack,
            icon_emoji: URL to image to use as notifications icon,
          },
        },
        */
      ]
    },
  };


};

