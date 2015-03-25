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
    },

    '/models': {
      GET: 'admin.models.index'
    },

    '/model': {
      '/columns': {
        GET: 'admin.models.columns'
      },
      '/rows': {
        GET: 'admin.models.rows'
      },
      '/doc': {
        GET: 'admin.models.doc',
        PUT: 'admin.models.docUpdate'
      },
    },
  }
 };

