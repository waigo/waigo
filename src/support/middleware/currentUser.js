"use strict";

/**
 * @fileOverview Setup current user on request context.
 */


var waigo = global.waigo,
  _ = waigo._;



/**
 * Build middleware for setting up context-level helpers and template vars.
 *
 * This should be the last middleware which gets run prior to route-specific 
 * middleware.
 * 
 * @return {Function} middleware
 */
module.exports = function() {
  return function*(next) {
    if (this.session.user) {
      this.app.logger.debug('Current user', this.session.user);

      this.currentUser =  
        yield this.app.models.User.findOne({
          _id: this.session.user._id
        })
      ;
    }

    yield next;
  }
};
