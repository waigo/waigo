/**
 * Session config.
 *
 * We don't provide a default 'secret' so as to encourage developers to provide a custom one for their app.
 *
 * @type {String}
 */
exports.session = {
  secret: '7b5f7cff7eb41b73c9d0e8c33b01db0b',  // This should be provided by apps
  store: {
    type: 'mongo',
    config: {
      url: 'mongodb://127.0.0.1:27017/sessions'
    }
  },
  cookie: {
    validForDays: 7,
    path: '/'
  }
};
