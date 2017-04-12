const co = require('co')

const waigo = require('waigo'),
  _ = waigo._,
  errors = waigo.load('errors')

const AclError = exports.AclError = errors.define('AclError')

const AclDbModel = {
  schema: {
    resource: {
      type: String,
      required: true,
    },
    entityType: {
      type: String,
      required: true,
      enum: ['role', 'user'],
    },
    entity: {
      type: String,
      required: true,
    }
  }
}

class Acl {
  /**
   * @constructor
   * @param  {Application} App The Waigo app.
   */
  constructor (App) {
    this.App = App
    this.logger = App.logger.create('ACL')
  }

  /**
   * @override
   */
  *init () {
    this.dbModel = yield this.App.db.model('acl', AclDbModel)

    // reload data
    yield this.reload()

    // access to admin content must be protected
    if (!this.res.admin) {
      this.logger.info('Admin resources rules not found, so creating them now')

      yield this.dbModel.insert({
        resource: 'admin',
        entityType: 'role',
        entity: 'admin'
      })

      yield this.reload()
    }

    // get notified of ACL updates
    this._changeFeedCursor = yield this.dbModel.onChange()
    if (this._changeFeedCursor) {
      this._changeFeedCursor.each(_.bind(this._onAclUpdated, this))
    }
  }

  /**
   * @override
   */
  *destroy () {
    if (this._changeFeedCursor) {
      yield this._changeFeedCursor.close()

      this._changeFeedCursor = null
    }
  }


  /**
   * Reload ACL rules from DB.
   */
  *reload () {
    this.logger.debug('Reloading rules from db')

    const data = yield this.dbModel.getAll()

    const res = this.res = {},
      users = this.users = {},
      roles = this.roles = {}

    data.forEach(function (doc) {
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
   *
   * @param  {String} resource Resource name.
   * @param  {Object} user     User model document.
   *
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

/**
 * Initialise ACL manager.
 *
 * @param  {Object} App Appliaction object.
 * @return {Object} ACL manager.
 */
exports.init = function *(App) {
  const acl = new Acl(App)

  yield acl.init()

  return acl
}
