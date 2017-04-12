const waigo = require('waigo'),
  Base = waigo.load('models/support/base')


const ActivityDbModel = {
  // Based on https://tools.ietf.org/html/draft-snell-activitystreams-09
  schema: {
    // what
    verb: {
      type: String,
      required: true,
    },
    // when
    published: {
      type: Date,
      required: true,
    },
    // who
    actor: {
      type: {
        // unique id (if null then by the system)
        id: {
          type: String,
          required: false,
        },
        // friendly display name
        displayName: {
          type: String,
          required: true,
        }
      },
      required: true,
    },
    // additional details
    details: {
      type: Object,
      adminViewOptions: {
        hide: true,
      },
    }
  }
}


class Activity extends Base {
  /**
   * @override
   */
  *init () {
    this.logger.info('Creating Activity db model')

    this.dbModel = yield this.App.db.model('activity', ActivityDbModel)
  }


  /**
   * Record an activity.
   *
   * @param {String} verb          activity name
   * @param {String|User} actor    `User` who did it. Or name of system process.
   * @param {Object} [details]     Additional details.
   *
   * @return {Object} the created activity object
   */
  *record (verb, actor, details) {
    this._logger().debug('Recording activity', verb, actor.id || actor, details)

    if (!actor || !actor.id) {
      actor = {
        displayName: (typeof actor === 'string' ? actor : 'system')
      }
    } else {
      actor = {
        id: '' + actor.id,
        displayName: actor.username,
      }
    }

    const qry = {
      verb: verb,
      actor: actor,
      published: new Date(),
    }

    if (details) {
      qry.details = details
    }

    return yield this.insert(qry)
  }


  /**
   * Get activities.
   *
   * @param {Object} filter Query filter.
   *
   * @return {Array} The matching activities.
   */
  *getByFilter (filter) {
    return yield this.dbModel.getFiltered(filter)
  }

  /**
   * Get latest activity of given type by given actor.
   *
   * @param {String} verb Activity type.
   * @param {String} actorId Actor id.
   *
   * @return {Object} The matching activity, otherwise `null`.
   */
  *getLatestOfTypeByActor (verb, actorId) {
    return yield this.dbModel.getLatestOfTypeByActor(verb, actorId)
  }
}

module.exports = Activity
