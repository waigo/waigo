"use strict";



module.exports = function(app) {
  const db = app.db;

  const Acl = db.createModel("Acl", {
    id: db.type.string().required(),
    resource: db.type.string().required(),
    entityType: db.type.string().required().enum('role', 'user'),
    entity: db.type.string().required(),
  }, {
    enforce_missing: true
  });

  Acl.admin = {
    listView: ['resource', 'entityType', 'entity'],
  };

  return Acl;
};
