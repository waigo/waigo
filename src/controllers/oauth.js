"use strict";

const waigo = require('waigo'),
  oauth = waigo.load('support/oauth/index'),
  errors = waigo.load('support/errors');

const OauthError = waigo.load('support/oauth/errors').OauthError;



exports.getAuthorizeUrl = function*() {
  var impl = yield oauth.load(this, this.request.query.provider);

  yield this.render('getAuthorizeUrl', {
    url: yield impl.getAuthorizeUrl(),
  });
};



exports.callback = function*() {
  var provider = this.request.params.provider;

  var impl = yield oauth.load(this, provider);

  let user = this.currentUser;

  yield this.record('oauth_callback', user || 'anon', {
    provider: provider,
  });

  try {
    let errorMsg = this.request.query.error,
      errorDesc = this.request.query.error_description;

    if (errorMsg) {
      throw new OauthError(errorMsg, 400, errorDesc);
    }
    
    // we got the code!
    let code = this.request.query.code;

    if (!code) {
      throw new OauthError('Failed to obtain OAuth code', 400);
    }

    let response = yield impl.getAccessToken(code);

    this.logger.info('OAuth access token', provider, response.access_token);

    // create user if not set
    if (!user) {
      user = yield this.app.models.User.register({
        email: response.result.info.email,
        emailVerified: true,
        roles: [],
      });
    }

    // save oauth info
    yield user.saveOAuth(provider, response);

    // all done!
    yield impl.handleSuccess();
  } catch (err) {
    this.app.logger.error('OAuth error', err);

    yield impl.handleError(err);
  }
};




