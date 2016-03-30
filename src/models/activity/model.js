"use strict";


const waigo = global.waigo,
  _ = waigo._,
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
      def: tableDef,
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
        displayName: (typeof actor === 'string' ? actor : 'system')
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


  * getByFilter (filter) {
    let ret = yield this._qry().filter(filter).run();

    return this._wrap(ret);
  }



  * getRegistrationsSince (date) {
    let ret = yield this._qry().filter(function(doc) {
      return doc('published').ge(date) && doc('verb').eq('register');
    }).run();

    return this._wrap(ret);
  }


  * getLatest (verb, actorId) {
    const r = this.db;

    let ret = yield this._qry().filter(function(doc) {
      return doc('user')('id').eq(actorId) && doc('verb').eq(verb);
    })
      .orderBy(r.desc('published'))
      .limit(1)
      .run();

    return this._wrap(_.get(ret, '0'));
  }

}



module.exports = Model;
