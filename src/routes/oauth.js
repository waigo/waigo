


module.exports = {
  '/oauth': {
    '/get_authorize_url': {
      GET: 'oauth.getAuthorizeUrl',
    },
    '/callback/:provider': {
      name: 'oauth_callback',
      GET: 'oauth.callback',
    }
  }
};
