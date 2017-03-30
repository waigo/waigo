

const waigo = global.waigo,
  oauth = waigo.load('support/oauth/index')





exports.getAuthorizeUrl = function *() {
  const impl = yield oauth.load(this, this.request.query.provider)

  yield this.render('getAuthorizeUrl', {
    url: impl.getAuthorizeUrl(),
  })
}



exports.callback = function *() {
  const provider = this.request.params.provider

  const impl = yield oauth.load(this, provider)

  yield impl.handleAuthorizationCallback()
}
