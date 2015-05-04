"use strict";

module.exports = { 
  '/user': {
    '/register': {
      GET: 'user.register',
      POST: 'user.register_submit'
    },
    '/login': {
      GET: 'user.login',
      POST: 'user.login_submit',
    },
    '/forgot_password': {
      GET: 'user.forgot_password',
      POST: 'user.forgot_password_submit',
    },
    '/reset_password': {
      name: 'reset_password',
      GET: 'user.reset_password',
      POST: 'user.reset_password_submit',
    },
    '/logout': {
      GET: 'user.logout'
    },
  }
};

