

const waigo = global.waigo,
  _ = waigo._,
  OauthError = waigo.load('support/oauth/error'),
  GenericOauth = waigo.load('support/oauth/providers/generic')





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

  const Impl = GenericOauth

  try {
    Impl = waigo.load(`support/oauth/providers/${provider}`)
  } catch (err) {
    ctx.logger.warn(`No OAuth implementation found for "${provider}", using generic.`, err)
  }

  return new Impl(ctx, provider, tokens)
}



