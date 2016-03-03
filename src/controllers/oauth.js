"use strict";

const waigo = global.waigo,
  oauth = waigo.load('support/oauth/index');





exports.getAuthorizeUrl = function*() {
  let impl = yield oauth.load(this, this.request.query.provider);

  yield this.render('getAuthorizeUrl', {
    url: impl.getAuthorizeUrl(),
  });
};



exports.callback = function*() {
  let provider = this.request.params.provider;

  let impl = yield oauth.load(this, provider);

  yield impl.handleAuthorizationCallback();
};

