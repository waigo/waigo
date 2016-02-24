"use strict";



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

  return Activity;
};


