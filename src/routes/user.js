"use strict";

module.exports = { 
  '/user': {
    '/register': {
      GET: 'user.register',
      POST: 'user.register_submit'
    },
    '/login': {
      name: 'user_login',
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
    '/verify_email': {
      name: 'verify_email',
      GET: 'user.verify_email',
    },
    '/logout': {
      GET: 'user.logout'
    },
  }
};

