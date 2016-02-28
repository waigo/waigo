"use strict";

const waigo = require('waigo'),
  _ = waigo._,
  errors = waigo.load('support/errors');



const OauthError = exports.OauthError = errors.define('OauthError');



exports.load = function*(ctx, provider, tokens) {
  if (!provider) {
    throw new OauthError('No oauth provider given', 404);
  }  

  let Impl;

  try {
    Impl = waigo.load(`support/oauth/${provider}`);
  } catch (err) {
    throw new OauthError(`Invalid oauth provider: ${provider}`, 500, err);
  }

  // see if we have an access token for this provider for current user
  if (!tokens) {
    let user = ctx.currentUser;

    if (user) {
      tokens = user.getOauth(provider);
    }
  }

  return new Impl(ctx, tokens);
}



