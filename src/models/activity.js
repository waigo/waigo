"use strict";

const waigo = global.waigo,
  _ = waigo._;


const UserSchema = {
  // unique id (if null then by the system)
  id: {    
    type: String,
    required: false,
  },
  // friendly display name
  displayName: {
    type: String,
    required: true,
  },
};


// Based on https://tools.ietf.org/html/draft-snell-activitystreams-09
exports.schema = {
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
    type: UserSchema,
    required: true,
  },
  // additional details
  details: {
    type: Object,
  },
};


exports.indexes = [
  {
    name: 'verb',
  },
  {
    name: 'published',
  },
  { 
    name: 'actor',
    def: function(doc) {
      return doc('actor')('id');
    },
  },
];


exports.modelMethods = {
  /**
   * Record an activity.
   * 
   * @param {String} verb          activity name
   * @param {String|User} actor    `User` who did it. Or name of system process.
   * @param {Object} [details]     Additional details.
   * 
   * @return {Activity} the created activity object
   */
  record: function*(verb, actor, details) {
    this._logger().debug('Recording activity', verb, actor.id || actor, details);

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

    return yield this.insert(qry);
  },
  getByFilter: function*(filter) {
    let ret = yield this.rawQry().filter(filter).run();

    return this.wrapRaw(ret);
  },
  getRegistrationsSince: function*(date) {
    let ret = yield this.rawQry().filter(function(doc) {
      return doc('published').ge(date) && doc('verb').eq('register');
    }).run();

    return this.wrapRaw(ret);
  },
  getLatest: function*(verb, actorId) {
    const r = this.db;

    let ret = yield this.rawQry().filter(function(doc) {
      return doc('user')('id').eq(actorId) && doc('verb').eq(verb);
    })
      .orderBy(r.desc('published'))
      .limit(1)
      .run();

    return this.wrapRaw(_.get(ret, '0'));
  }  
};
