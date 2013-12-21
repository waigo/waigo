exports.session = {
  name: 'waigo-demo',
  keys: ['7b5f7cff7eb41b73c9d0e8c33b01db0b'],
  store: {
    type: 'mongo',
    config: {
      useAppMongooseDbConn: true,
      collection: 'sessions'
    }
  },
  cookie: {
    validForDays: 7,
    path: '/'
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

