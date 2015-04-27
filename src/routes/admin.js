 module.exports = { 
  '/admin': {
    pre: [
      { 
        id: 'assertUser', 
        redirectToLogin: true,
      },
    ],

    GET: 'admin.index.main',

    '/routes': {
      pre: [
        { 
          id: 'assertUser', 
          canAccess: 'admin',
        },
      ],

      GET: 'admin.routes.index'
    },

    '/models': {
      pre: [
        { 
          id: 'assertUser', 
          canAccess: 'admin',
        },
      ],

      GET: 'admin.models.index',

      '/model': {
        '/columns': {
          GET: 'admin.models.columns'
        },
        '/rows': {
          POST: 'admin.models.rows'
        },
        '/doc': {
          GET: 'admin.models.doc',
          PUT: 'admin.models.docUpdate'
        },
      },      
    },

  }
 };

