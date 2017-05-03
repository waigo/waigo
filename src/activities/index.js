const waigo = global.waigo,
  _ = waigo._

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
    const actorId = _.get(actor, 'id', actor)

    this.logger.debug('Recording activity', verb, actorId, details)

    if (!actorId) {
      actor = {
        displayName: 'system'
      }
    } else {
      actor = {
        id: '' + actorId,
        displayName: _.get(actor, 'username', ''),
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
   * Get latest matching activity exists.
   *
   * @param {Object} params         Activity attributes
   *
   * @return {Object} The matching activity or `null` if none found.
   */
  *getLatest (params) {
    return yield this.dbModel.getLatest(params)
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
