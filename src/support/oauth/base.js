"use strict";

const qs = require('query-string'),
  oauth = require('oauth');


const waigo = global.waigo,
  _ = waigo._,
  Q = waigo.load('support/promise'),
  errors = waigo.load('support/errors');




/**
 * Top-level OAuth errors class.
 */
const OauthError = exports.OauthError = errors.define('OauthError');


/**
 * Base class for OAuth providers.
 */
class Oauth {
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
    });

    this.oauth2 = new oauth.OAuth2(this.config.clientId,
      this.config.clientSecret, 
      this.config.baseURL,
      this.config.authorizePath,
      this.config.accessTokenPath,
      {
        'Content-Type': 'application/json'
      }
    );

    this.tokens = tokens;

    if (tokens) {
      this.authHeader = {
        'Authorization': 'Bearer ' + tokens.access_token,
      };
    }
  }


  /**
   * Get OAuth authorization URL.
   * @return {String}
   */
  getAuthorizeUrl () {
    let params = this._buildBasicParams();

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

    this.logger.info(`Get access token: user=${user.id} code=${code}`);

    try {
      return yield new Q(function(resolve, reject) {
        let params = this._buildBasicParams();

        this.oauth2.getOAuthAccessToken(code, params, (err, access_token, refresh_token, result) => {
          if (err) {
            return reject(new OauthError('Get access token error', err.statusCode || 400, err));
          }

          // check that scope is still the same
          if (result.scope !== _.get(this.config, 'authorizeParams.scope')) {
            return reject(new OauthError('Scope mismatch'));
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
  };



  * _request (method, url, queryParams, body) {
    let url = this._buildRequestUrl(url, queryParams);

    this.logger.debug(method, url);

    if (body) {
      body = JSON.stringify(body);
    }

    try {
      return yield new Q(function(resolve, reject) {
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


  _buildBasicParams () {
    let params = _.extend({}, _.get(this.config, 'accessTokenParams'));

    params[_.get(this.config, 'callbackParam', 'redirect_uri'))] = this.callbackURL;

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
  };

}

exports.Oauth = Oauth;






