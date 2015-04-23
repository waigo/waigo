"use strict";

/**
 * @fileOverview Setup context-level convenient accessors and template helpers
 */

var URL = require('url');

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
      this.app.logger.debug('Current user', this.session.user);

      this.currentUser = this.locals.currentUser = 
        yield this.app.models.User.findOne({
          _id: this.session.user._id
        })
      ;
    }

    // template helpers
    this.locals.matchesCurrentUrl = _.bind(exports.matchesCurrentUrl, this);

    // convenient accessors
    this.logger = this.app.logger;
    this.acl = this.app.acl;
    this.models = this.app.models;
    this.form = this.app.form;

    yield next;
  }
};


/** 
 * Get whether given URL path matches current URL path.
 * @param  {String} urlPath URL path.
 * @return {Boolean}  true if so; false otherwise.
 */
exports.matchesCurrentUrl = function(urlPath) {
  var parsedURL = URL.parse(this.request.url);

  return (0 === pathname.indexOf(urlPath));
};


