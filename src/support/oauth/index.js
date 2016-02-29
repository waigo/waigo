"use strict";

const waigo = global.waigo,
  _ = waigo._,
  errors = waigo.load('support/errors'),
  GenericOauth = waigo.load(`support/oauth/generic`);


/**
 * Top-level OAuth errors class.
 */
const OauthError = exports.OauthError = errors.define('OauthError');





exports.load = function*(ctx, provider, tokens) {
  if (!provider) {
    throw new OauthError('No OAuth provider given', 404);
  }  

  // see if we have an access token for this provider for current user
  if (!tokens) {
    let user = ctx.currentUser;

    if (user) {
      tokens = user.getOauth(provider);
    }
  }

  let Impl = GenericOauth;

  try {
    Impl = waigo.load(`support/oauth/${provider}`);
  } catch (err) {
    ctx.logger.warn(`No OAuth implementation found for "${provider}", using generic.`);
  }

  return new Impl(ctx, provider, tokens);
}



