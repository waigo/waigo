

const co = require('co')

const waigo = global.waigo,
  _ = waigo._,
  logger = waigo.load('support/logger'),
  errors = waigo.load('support/errors')


const AclError = exports.AclError = errors.define('AclError')


class ACL {
  constructor (App) {
    this.App = App
    this.logger = logger.create('ACL')
  }


  /**
   * Initialise ACL
   */
  * startup () {
    this.logger.info('Initialising')

    yield this.reload()

    // access to admin content must be protected
    if (!this.res.admin) {
      this.logger.info('Admin resources rules not found, so creating them now')

      yield this.App.models.Acl.insert({
        resource: 'admin',
        entityType: 'role',
        entity: 'admin'
      })

      yield this.reload()
    }

    // get notified of ACL updates
    this._changeFeedCursor = yield this.App.models.Acl.onChange()
    if (this._changeFeedCursor) {
      this._changeFeedCursor.each(_.bind(this._onAclUpdated, this))
    }
  }


  * shutdown () {
    if (this._changeFeedCursor) {
      yield this._changeFeedCursor.close()

      this._changeFeedCursor = null
    }
  }


  /**
   * Reload ACL rules from DB.
   */
  * reload () {
    this.logger.debug('Reloading rules from db')

    const data = yield this.App.models.Acl.getAll()

    const res = this.res = {},
      users = this.users = {},
      roles = this.roles = {}

    data.forEach(function (doc){
      // resource perspective
      res[doc.resource] = 
        res[doc.resource] || {}

      res[doc.resource][doc.entityType] = 
        res[doc.resource][doc.entityType] || {}

      res[doc.resource][doc.entityType][doc.entity] = true

      // entity perspsective
      const entity = ('user' === doc.entityType ? users : roles)

      entity[doc.entity] = entity[doc.entity] || {}
      entity[doc.entity][doc.resource] = true
    })
  }


  /**
   * Callback for collection watcher.
   */
  _onAclUpdated () {
    this.logger.info('Detected ACL rules change...reloading')

    co(this.reload())
      .catch((err) => {
        this.logger.error('Error reloading ACL', err.stack)
      })
  }


  /**
   * Get whether given user can access given resource.
   * @param  {String} resource Resource name.
   * @param  {Object} user     User object.
   * @return {Boolean} true if allowed false otherwise.
   */
  can (resource, user) {
    this.logger.debug('can', resource, user.id)

    // if resource name is "public" then everyone has access
    if ('public' === resource) {
      return true
    }

    // if user is admin it's ok
    if (user.isOneOf('admin')) {
      return true
    }

    // if no entry for resource then everyone has access
    if (!_.get(this.res, resource)) {
      return false
    }

    // if user has access it's ok
    if (_.get(this.users, user.id + '.' + resource)) {
      return true
    }

    // if one of user's roles has access it's ok 
    const roles = user.roles || []

    for (const role of roles) {
      if (_.get(this.roles, role + '.' + resource)) {
        return true
      }
    }

    return false
  }

  /**
   * Assert that given user can access given resource.
   * @param  {String} resource Resource name.
   * @param  {Object} user     User object.
   * @throws AclError if access disallowed.
   */
  assert (resource, user) {
    this.logger.debug('assert', resource, user.id)

    if (!this.can(resource, user)) {
      throw new AclError(`User ${user.id} does not have permission to access: ${resource}`, 403)
    }
  }
}


exports.ACL = ACL



/**
 * Initialise ACL
 * 
 * @param {App} App The App instance.
 */
exports.init = function *(App) {
  const a = new ACL(App)

  yield a.startup()

  return a
}



