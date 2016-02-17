"use strict";


module.exports = { 
  '/admin': {
    pre: [
      { 
        id: 'assertUser', 
        redirectToLogin: true,
      },
      'admin.index.configureMenu',
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
          POST: 'admin.models.docCreate',
          PUT: 'admin.models.docUpdate',
          DEL: 'admin.models.docDelete',
        },
      },      
    },

    '/emails': {
      pre: [
        { 
          id: 'assertUser', 
          canAccess: 'admin',
        },
      ],

      GET: 'admin.emails.index',

      '/render': {
        POST: 'admin.emails.render',
      },

      '/send': {
        POST: 'admin.emails.send',
      },
    },

    '/cron': {
      pre: [
        { 
          id: 'assertUser', 
          canAccess: 'admin',
        },
      ],

      GET: 'admin.cron.index',

      '/run': {
        POST: 'admin.cron.run',
      },

      '/updateStatus': {
        POST: 'admin.cron.updateStatus',
      },
    },

  }
 };

