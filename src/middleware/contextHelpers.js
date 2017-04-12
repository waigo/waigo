/**
 * @fileOverview Setup context-level convenient accessors and template helpers
 */



/**
 * Build middleware for setting up context-level helpers and template vars.
 *
 * This should be the last middleware which gets run prior to route-specific
 * middleware.
 *
 * @return {Function} middleware
 */
module.exports = function () {
  return function *(next) {
    // request template vars
    this.templateVars = this.templateVars || {}
    this.templateVars.currentUser = this.currentUser
    this.templateVars.currentUrl = this.request.url

    // convenient accessors
    this.logger = this.App.logger
    this.models = this.App.models
    this.acl = this.App.acl
    this.form = this.App.form

    yield next
  }
}
