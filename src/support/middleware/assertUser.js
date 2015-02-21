"use strict";

var querystring = require('querystring');


var waigo = require('../../../'),
  _ = waigo._;




/**
 * Build middleware to assert properties regarding the current user.
 *
 * Should be preceded by middleware: `session`, `outputFormats`.
 * 
 * @param {Object} [options] Configuration options.
 * @param {Boolean} [options.loggedIn] User must be logged in.
 * @param {Array} [options.role] User must have one of the following roles.
 *
 * @return {Function}
 */
module.exports = function(options) {
  return function*(next) {
    try {
      var user = this.session.user;

      if (options.loggedIn && !user) {
        throw new Error('You must be logged in to access this content.');
      }

      // needs specific role?
      if (options.role) {
        var userRoles = _.get(user, 'roles', []);

        // if doesn't have required role AND is not an admin then puke
        if (0 > userRoles.indexOf('admin') && 
              0 === _.intersection(userRoles, options.role).length) {
          throw new Error('You must have one of the following roles to access this content: ' + options.role.join(', '));
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
