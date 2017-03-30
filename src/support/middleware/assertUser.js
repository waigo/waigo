


const waigo = global.waigo,
  _ = waigo._,
  RuntimeError = waigo.load('support/errors').RuntimeError;




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
module.exports = function(App, options) {
  return function*(next) {
    this.App.logger.debug('assertUser is logged in');

    try {
      if (!this.currentUser) {
        throw new RuntimeError('You must be logged in to access this content.', 403);
      } else {
        // need specific access?
        if (options.canAccess) {
          this.App.logger.debug('assertUser can access ' + options.canAccess);

          yield this.currentUser.assertAccess(options.canAccess);
        }
      }
    } catch (err) {
      // should we ask user to login?
      if (options.redirectToLogin) {
        this.App.logger.debug('redirect to login');

        return yield this.redirect(
          this.App.routes.url('user_login', null, {
            r: err.message,
            u: this.request.url,            
          })
        );
      }
      // else show error
      else {
        throw err;
      }
    }

    yield next;
  };
};
