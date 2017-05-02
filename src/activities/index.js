class Activity {
  /**
   * @constructor
   * @param  {Application} App The Waigo app.
   */
  constructor (App) {
    this.App = App
    this.logger = App.logger.create('Activity')
  }

  /**
   * Initialize
   */
  *init () {
    this.dbModel = yield this.App.db.model('Activity')
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
    this.logger.debug('Recording activity', verb, actor.id || actor, details)

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

    const data = {
      verb,
      actor,
      published: new Date(),
    }

    if (details) {
      data.details = details
    }

    yield this.dbModel.insert(data)
  }


  /**
   * Get whether given activity exists.
   *
   * @param {String} verb          activity name
   * @param {String|User} actor    `User` who did it. Or name of system process.
   * @param {Object} [details]     Additional details.
   *
   * @return {Array} The matching activities.
   */
  *exists (verb, details) {
    return yield this.dbModel.exists(verb, details)
  }
}



/**
 * Initialise Activity recorder.
 *
 * @param  {Object} App Application object.
 * @return {Object} Activity recorder.
 */
exports.init = function *(App) {
  const activityRecorder = new Activity(App)

  yield activityRecorder.init()

  return activityRecorder
}
