 module.exports = { 
  '/admin': {

    pre: [
      { id: 'assertUser', role: ['admin'] },
    ],

    GET: 'admin.index.main',

    sub: {
      '/routes': {
        GET: 'admin.routes.index'
      }
    }
  }
 };

