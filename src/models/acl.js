"use strict";


const waigo = global.waigo,
  _ = waigo._;


function buildModelMethods(app) {
  return {
    /**
     * Load ACK.
     * @return {Array}
     */
    load: function*() {
      return yield this.execute();
    }
  };
}




module.exports = function(app) {
  const db = app.db;

  const Acl = db.createModel("Acl", {
    resource: db.type.string().required(),
    entityType: db.type.string().required().enum('role', 'user'),
    entity: db.type.string().required(),
  }, {
    enforce_missing: true
  });

  Acl.admin = {
    listView: ['resource', 'entityType', 'entity'],
  };

  _.each(buildModelMethods(app), function(fn, k) {
    Acl[k] = _.bind(fn, Acl);
  });

  return Acl;
};
