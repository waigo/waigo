"use strict";


const waigo = global.waigo,
  _ = waigo._;




function buildModelMethods(app) {
  return {
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
      app.logger.debug('Recording activity', verb, actor.id || actor, details);

      if (!actor.id) {
        actor = {
          displayName: actor
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

      return yield this.save(qry);
    }
  };
}



module.exports = function(app) {
  const db = app.db;

  const Activity = db.createModel("Activity", {
    verb: db.type.string().required(),
    published: db.type.date().required(),
    actor: {
      id: db.type.string().optional(),
      displayName: db.type.string().required(),
    },
    details: db.type.object().optional(),
  }, {
    enforce_missing: true
  });

  Activity.admin = {
    listView: ['verb', 'actor', 'published'],
  };

  Activity.ensureIndex('verb');
  Activity.ensureIndex('published');
  Activity.ensureIndex('actor', function(doc) {
    return doc('actor')('id');
  });

  _.each(buildModelMethods(app), function(fn, k) {
    Activity[k] = _.bind(fn, Activity);
  });

  return Activity;
};


