/** Development config */

exports.baseURL = 'http://localhost:3000';

exports.db = {
  mongoose: {
    host: '127.0.0.1',
    port: '27017',
    db: 'waigo-dev'
  }
};

exports.errorHandlerConfig = {
  showStack: true
};

exports.logging = {
  winston: {
    console: {
      level: 'info',
      colorize: true,
      timestamp: true
    }
  }
};

