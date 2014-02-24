/**
 * # Base configuration
 *
 * This is the base configuration module which gets loaded first by the [configuration loader](index.js.html).
 */



/**
 * Server listening port.
 * @type {Number}
 */
exports.port = 3000;


/**
 * Base web URL
 * @type {String}
 */
exports.baseURL = 'http://localhost:' + exports.port;


/**
 * Database connection.
 * @type {Object}
 */
exports.db = {
  mongoose: {
    host: '127.0.0.1',
    port: '27017',
    db: 'waigo'
  }
};


/**
 * Logging config.
 * @type {Object}
 */
exports.logging = {
  winston: {
    // log to mongo db
    mongo: {
      // log level threshold
      level: 'error',
      collection: 'logs',
      // whether to confirm writes to db log table
      safe: false
    }
  }
};




/**
 * Session configuration.
 *
 * We don't provide default `keys` so as to encourage developers to provide a custom one for their app.
 *
 * @type {Object}
 */
exports.session = {
  // cookie signing keys - these are used for signing cookies (using Keygrip) and should be set for your app
  // keys: ['use', 'your', 'own'],
  // session cookie name
  name: 'waigo',
  // session storage
  store: {
    // session store type
    type: 'mongo',
    // session store config
    config: {
      url: 'mongodb://127.0.0.1:27017/waigo',
      collection: 'sessions'
    }
  },
  // more cookie options
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
exports.outputFormats = {
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
 * Static resources (relative to app root folder).
 * @type {String}
 */
exports.staticFolder = '../public';


/**
 * Config for request error handler.
 * @type {Object}
 */
exports.errorHandler = {
  // whether to show stack traces in error output.
  showStack: false
};
