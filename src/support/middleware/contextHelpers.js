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

    // current user
    this.locals.currentUser = this.currentUser;

    // template helpers
    this.locals.matchesCurrentUrl = _.bind(matchesCurrentUrl, this);

    // convenient accessors
    this.logger = this.app.logger;
    this.acl = this.app.acl;
    this.models = this.app.models;
    this.form = this.app.form;

    processAlertMessage(this);

    yield next;
  }
};


/** 
 * Get whether given URL path matches current URL path.
 * @param  {String} urlPath URL path.
 * @return {Boolean}  true if so; false otherwise.
 */
var matchesCurrentUrl = exports.matchesCurrentUrl = function(urlPath) {
  var parsedURL = URL.parse(this.request.url),
    parsedPath = URL.parse(urlPath);

  return (parsedURL.pathname === parsedPath.pathname);
};



var processAlertMessage = exports.processAlertMessage = function(ctx) {
  // clear current alert message (and save it for templates)
  if (ctx.session.alertMsg) {
    ctx.locals.alertMsg = ctx.session.alertMsg;
    ctx.session.alertMsg = null;
  }

  // set alert msg for next page show
  ctx.showAlert = function*(msg) {
    ctx.session.alertMsg = msg;
  };
}


