"use strict";


/**
 * @fileOverview Setup context-level convenient accessors and template helpers
 */


var waigo = require('../../../'),
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
    this.locals = this.locals || {};

    if (this.session.user) {
      this.currentUser = this.locals.currentUser = 
        yield this.app.models.User.findOne({
          _id: this.session.user._id
        })
      ;
    }

    // convenient accessors
    this.logger = this.app.logger;
    this.acl = this.app.acl;
    this.models = this.app.models;
    this.form = this.app.form;

    yield next;
  }
};
