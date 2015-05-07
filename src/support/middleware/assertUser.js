"use strict";

var querystring = require('querystring');


var waigo = require('../../../'),
  _ = waigo._;




/**
 * Build middleware to assert properties regarding the current user.
 *
 * Should be preceded by middleware: `session`, `outputFormats`, `contextHelpers`.
 *
 * By default it checks that the user is logged in. Note that admin users will 
 * bypass checks and always have access to everything.
 * 
 * @param {Object} [options] Configuration options.
 * @param {Array} [options.canAccess] User must be allowed to access this resource.
 *
 * @return {Function}
 */
module.exports = function(options) {
  return function*(next) {
    try {
      if (!this.currentUser) {
        this.throw('You must be logged in to access this content.', 403);
      } else {
        // if user is not an admin
        if (!this.currentUser.isOneOf('admin')) {
          // need specific access?
          options.canAccess && this.currentUser.assertAccess(options.canAccess);
        }
      }
    } catch (err) {
      // should we ask user to login?
      if (options.redirectToLogin) {
        var qryStr = querystring.stringify({
          r: err.message,
          u: this.request.url,
        });

        yield this.redirect('/user/login?' + qryStr);
      }
      // else show error
      else {
        throw err;
      }
    }

    yield next;
  };
};
