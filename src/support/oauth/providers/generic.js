"use strict";

const qs = require('query-string'),
  OAuth2 = require('oauth').OAuth2;


const waigo = global.waigo,
  _ = waigo._,
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
    this.logger = context.logger.create(`Oauth-${provider}`);

    this.config = _.get(this.app.config.oauth, this.provider, {});
    this.callbackURL = this.app.routeUrl('oauth_callback', {
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

    this.tokens = tokens;

    if (this.tokens) {
      this.authHeader = {
        'Authorization': `Bearer ${this.tokens.access_token}`,
      };
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


  /**
   * Get OAuth access token.
   * @param {String} code Code returned by OAuth provider.
   */
  * getAccessToken (code) {
    let user = this._user();

    this.logger.info(`Get access token: user=${user.id ? user.id : 'anon'} code=${code}`);

    try {
      return yield new Q((resolve, reject) => {
        let params = this._buildAccessTokenParams();

        this.oauth2.getOAuthAccessToken(code, params, (err, access_token, refresh_token, result) => {
          if (err) {
            return reject(new OauthError('Get access token error', err.statusCode || 400, err));
          }

          if (_.get(result, 'error')) {
            return reject(new OauthError(`Get access token error: ${result.error}`, 400, result.error));
          }

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

    url = this.config.apiBaseUrl + url;

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
    return _.get(this.context, 'currentUser', {});
  }


  * _handleError (err, attrs) {
    this.logger.error(err);

    yield this.context.record('oauth_request', this._user(), _.extend({}, attrs, {
      type: 'error',
      provider: this.provider,
      message: err.message,
      details: err.details,
    }));

    throw err;
  }

}

module.exports = GenericOauth;






