/** Testing config */

exports.baseURL = 'http://localhost:3000';

exports.db = {
  mongoose: {
    host: '127.0.0.1',
    port: '27017',
    db: 'waigo-test'
  }
};

exports.errorHandlerConfig = {
  showStack: true
};


exports.logging = {
  winston: {
    console: {
      level: 'debug',
      colorize: true,
      timestamp: true
    }
  }
};


