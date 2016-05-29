"use strict";

const qs = require('query-string'),
  OAuth2 = require('oauth').OAuth2;


const waigo = global.waigo,
  _ = waigo._,
  logger = waigo.load('support/logger'),
  Q = waigo.load('support/promise'),
  OauthError = waigo.load('support/oauth/error');






/**
 * Base class for OAuth providers.
 */
class GenericOauth {
  /**
   * @constructor
   * @param  {Object} context  Current request context.
   * @param  {String} provider Id of provider.
   * @param  {Object} [tokens]   Access tokens previously obtained.
   */
  constructor (context, provider, tokens) {
    this.context = context;
    this.provider = provider;
    this.app = this.context.app;
    this.logger = logger.create(`Oauth-${provider}`);

    this.config = _.get(this.app.config.oauth, this.provider, {});
    this.callbackURL = this.app.routes.url('oauth_callback', {
      provider: provider,
    }, null, {
      absolute: true
    });

    this.oauth2 = new OAuth2(
      this.config.clientId,
      this.config.clientSecret, 
      this.config.baseURL,
      this.config.authorizePath,
      this.config.accessTokenPath,
      this.config.customHeaders
    );

    if (tokens) {
      this._setTokens(tokens);
    }
  }


  /**
   * Get OAuth authorization URL.
   * @return {String}
   */
  getAuthorizeUrl () {
    let params = this._buildAuthorizeParams();

    let url = this.oauth2.getAuthorizeUrl(params);

    this.logger.debug('authorize url', url);

    return url;
  }


  * handleAuthorizationCallback() {
    let user = this._user();

    this.context.events.emit('record', 'oauth_callback', user || 'anon', {
      provider: this.provider,
      query: this.context.request.query,
    });

    try {
      let errorMsg = this.context.request.query.error,
        errorDesc = this.context.request.query.error_description;

      if (errorMsg) {
        throw new OauthError(errorMsg, 400, errorDesc);
      }
      
      // we got the code!
      let code = this.context.request.query.code;

      if (!code) {
        throw new OauthError('Failed to obtain OAuth code', 400);
      }

      let response = yield this.getAccessToken(code);

      yield this._handlePostAuthorizationSuccess(response);
    } catch (err) {
      yield this._handleError(err);
    }
  }


  /**
   * Get OAuth access token.
   * @param {String} code Code returned by OAuth provider.
   */
  * getAccessToken (code) {
    let user = this._user();

    this.logger.info(`Get access token: user=${user ? user.id : 'anon'} code=${code}`);

    try {
      return yield new Q((resolve, reject) => {
        let params = this._buildAccessTokenParams();

        this.oauth2.getOAuthAccessToken(code, params, (err, access_token, refresh_token, result) => {
          if (err) {
            return reject(new OauthError('Get access token error', err.statusCode || 400, err));
          }

          if (_.get(result, 'error')) {
            return reject(
              new OauthError(`Get access token error: ${result.error}`, 400, {
                error: result.error
              })
            );
          }

          this.logger.debug(`Get access token result: ${access_token}, ${refresh_token}, ${JSON.stringify(result)}`);

          this._setTokens({
            access_token: access_token,
            refresh_token: refresh_token,             
          });

          resolve({
            access_token: access_token,
            refresh_token: refresh_token, 
            result: result,
          });
        });
      });

    } catch (err) {
      yield this._handleError(err, {
        method: 'getOAuthAccessToken',
      });
    }
  }



  _setTokens (tokens) {
    this.tokens = tokens;

    if (this.tokens) {
      this.authHeader = {
        'Authorization': `Bearer ${this.tokens.access_token}`,
      };
    }
  }


  * _get (url, queryParams) {
    return yield this._request('GET', url, queryParams);
  }


  * _post (url, queryParams, body) {
    return yield this._request('POST', url, queryParams, body);
  }


  _buildRequestUrl (url, queryParams) {
    let apiBaseUrl = this.config.apiBaseUrl;

    if (!_.get(apiBaseUrl, 'length')) {
      throw new OauthError(`${this.provider}: apiBaseUrl must be provided`);
    }

    url = apiBaseUrl + url;

    queryParams = qs.stringify(queryParams || {});

    if (queryParams.length) {
      url += '?' + queryParams;
    }

    return url;
  }



  * _request (method, url, queryParams, body) {
    url = this._buildRequestUrl(url, queryParams);

    this.logger.debug(method, url);

    if (body) {
      body = JSON.stringify(body);
    }

    try {
      return yield new Q((resolve, reject) => {
        this.oauth2._request(method, url, this.authHeader, body, this.accessToken, (err, result) => {
          if (err) {
            return reject(new OauthError(method + ' error', err.statusCode || 400, err));
          }

          try {
            result = JSON.parse(result);
          } catch (e) {
            // nothing to do here
          }

          resolve(result);
        });
      });

    } catch (err) {
      yield this._handleError(err, {
        method: method,
        url: url,
        body: body,
      });
    }
  }


  _buildAuthorizeParams () {
    let params = _.extend({}, _.get(this.config, 'authorizeParams'));

    let callbackParamName = _.get(this.config, 'callbackParam', 'redirect_uri');

    params[callbackParamName] = this.callbackURL;

    return params;
  }


  _buildAccessTokenParams () {
    let params = _.extend({}, _.get(this.config, 'accessTokenParams'));

    let callbackParamName = _.get(this.config, 'callbackParam', 'redirect_uri');

    params[callbackParamName] = this.callbackURL;

    return params;
  }


  _user () {
    return this.context.currentUser;
  }


  * _handlePostAuthorizationSuccess (accessTokenResponse) {
    yield this.context.redirect("/");
  }


  * _handleError (err, attrs) {
    this.logger.error(err);

    this.context.events.emit('record', 'oauth_request', this._user() || 'anon', _.extend({}, attrs, {
      type: 'error',
      provider: this.provider,
      message: err.message,
      details: err.details,
    }));

    throw err;
  }

}

module.exports = GenericOauth;






