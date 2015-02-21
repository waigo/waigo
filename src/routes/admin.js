 module.exports = { 
  '/admin': {

    pre: [
      { 
        id: 'assertUser', 
        role: ['admin'],
        redirectToLogin: true,
      },
    ],

    GET: 'admin.index.main',

    '/routes': {
      GET: 'admin.routes.index'
    }
  }
 };

