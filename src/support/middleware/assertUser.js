"use strict";

var querystring = require('querystring');


var waigo = require('../../../'),
  _ = waigo._,
  RuntimeError = waigo.load('support/errors').RuntimeError;




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

      this.app.logger.debug('Session user', user);

      if (options.loggedIn && !user) {
        throw new RuntimeError('You must be logged in to access this content.', 403);
      }

      // load user
      var storedUser = yield this.app.models.User.findOne({
        _id: _.get(user, '_id')
      }, {
        fields: {
          roles: 1
        }        
      });
      var userRoles = _.get(storedUser, 'roles', []);

      // if user is not an admin
      if (0 > userRoles.indexOf('admin')) {
        // needs specific role?
        if (options.role) {
          // if doesn't have required role then puke
          if (0 === _.intersection(userRoles, options.role).length) {
            throw new RuntimeError('You must have one of the following roles to access this content: ' + options.role.join(', '), 403);
          }
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
