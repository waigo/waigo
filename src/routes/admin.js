 module.exports = { 
  '/admin': {
    pre: [
      { id: 'checkUserRole', role: 'admin' },
    ],

    GET: 'admin.index.main',

    sub: {
      '/routes': {
        GET: 'admin.routes.index'
      }
    }
  }
 };

