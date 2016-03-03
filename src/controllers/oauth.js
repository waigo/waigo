"use strict";

const waigo = global.waigo,
  oauth = waigo.load('support/oauth/index'),
  OauthError = waigo.load('support/oauth/error'),
  errors = waigo.load('support/errors');




exports.getAuthorizeUrl = function*() {
  let impl = yield oauth.load(this, this.request.query.provider);

  yield this.render('getAuthorizeUrl', {
    url: impl.getAuthorizeUrl(),
  });
};



exports.callback = function*() {
  let provider = this.request.params.provider;

  let impl = yield oauth.load(this, provider);

  let user = this.currentUser;

  yield this.record('oauth_callback', user || 'anon', {
    provider: provider,
    query: this.request.query,
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

    this.logger.info('OAuth access token', 
      provider, response.access_token, response);

    // all done!
    yield exports.handleCallbackSuccess.call(this, impl, response);
  } catch (err) {
    yield exports.handleCallbackError.call(this, impl, err);
  }
};



exports.handleCallbackSuccess = function*(impl, response) {
  yield this.redirect('/');
};


exports.handleCallbackError = function*(impl, err) {
  this.app.logger.error(`OAuth error - ${impl.provider}`, err);

  throw err;
};





