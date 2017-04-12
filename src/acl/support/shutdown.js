/**
 * Shutdown ACL.
 *
 * @param {Object} app The application.
 */
module.exports = function *(App) {
  if (App.acl) {
    App.logger.info('Shutting ACL')

    yield App.acl.destroy()
  }
}
