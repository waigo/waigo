const waigo = global.waigo,
  OauthError = waigo.load('oauth/support/error'),
  GenericOauth = waigo.load('oauth/generic')



exports.load = function *(ctx, provider, tokens) {
  if (!provider) {
    throw new OauthError('No OAuth provider given', 404)
  }

  // see if we have an access token for this provider for current user
  if (!tokens) {
    const user = ctx.currentUser

    if (user) {
      tokens = yield user.getOauth(provider)
    }
  }

  let Impl = GenericOauth

  try {
    Impl = waigo.load(`oauth/${provider}`)
  } catch (err) {
    ctx.logger.warn(`No OAuth implementation found for "${provider}", using generic.`, err)
  }

  return new Impl(ctx, provider, tokens)
}
