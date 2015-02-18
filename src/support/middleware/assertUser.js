"use strict";


var waigo = require('../../../'),
  _ = waigo._;




/**
 * Build middleware to assert properties regarding the current user.
 *
 * @param {Object} [options] Configuration options.
 * @param {Boolean} [options.loggedIn] User must be logged in.
 * @param {Array} [options.role] User must have one of the following roles.
 *
 * @return {Function}
 */
module.exports = function(options) {
  return function*(next) {
    var user = this.session.user;

    if (options.loggedIn && !user) {
      throw new Error('You must be logged in to view this content.');
    }

    if (options.role) {
      var userRoles = _.get(user, 'roles', []);

      if (0 === _.intersection(userRoles, options.role).length) {
        throw new Error('You must have one of the following roles to view this content: ' + options.role.join(', '));
      }
    }

    yield next;
  };
};
