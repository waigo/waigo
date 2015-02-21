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
    }
  }
};

