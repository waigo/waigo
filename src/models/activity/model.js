"use strict";


const waigo = global.waigo,
  Q = waigo.load('support/promise'),
  errors = waigo.load('support/errors'),
  Document = waigo.load('support/models/document'),
  RethinkDbModel = waigo.load('support/models/model').RethinkDbModel,
  adminConfig = waigo.load('models/activity/adminConfig'),
  tableDef = waigo.load('models/activity/tableDef'),
  docMethods = waigo.load('models/activity/docMethods');






class Model extends RethinkDbModel {
  constructor (app) {
    super(app, app.db, {
      name: "Activity",
      schema: tableDef.schema,
      indexes: tableDef.indexes,
      adminConfig: adminConfig,
      docMethods: docMethods,
    });
  }


  /**
   * Record an activity.
   * 
   * @param {String} verb          activity name
   * @param {String|User} actor    `User` who did it. Or name of system process.
   * @param {Object} [details]     Additional details.
   * 
   * @return {Activity} the created activity object
   */
  * record (verb, actor, details) {
    this.app.logger.debug('Recording activity', verb, actor.id || actor, details);

    if (!actor || !actor.id) {
      actor = {
        displayName: actor || 'system'
      }
    } else {
      actor = {
        id: '' + actor.id,
        displayName: actor.username,
      }
    }

    let qry = {
     verb: verb,
     actor: actor,
     published: new Date(), 
    }

    if (details) {
      qry.details = details;
    }

    return yield this._insert(qry);
  }



  * getRegistrationsSince (date) {
    let ret = yield this._native.filter(function(doc) {
      return doc('published').ge(date) && doc('verb').eq('register');
    }).execute();

    return this._wrap(ret);
  }

}



module.exports = Model;
