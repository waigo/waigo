"use strict";

const waigo = global.waigo,
  Q = waigo.load('support/promise'),
  errors = waigo.load('support/errors'),
  Document = waigo.load('support/models/document'),
  RethinkDbModel = waigo.load('support/models/model').RethinkDbModel,
  adminConfig = waigo.load('models/acl/adminConfig'),
  tableDef = waigo.load('models/acl/tableDef'),
  docMethods = waigo.load('models/acl/docMethods');




class AclModel extends RethinkDbModel {
  constructor (app) {
    super(app, app.db, {
      name: "Acl",
      schema: tableDef.schema,
      indexes: tableDef.indexes,
      adminConfig: adminConfig,
      docMethods: docMethods,
    });
  }

  /**
   * Load ACK.
   * @return {Array}
   */
  * load () {
    return yield this._getAll();
  }


  /**
   * Insert a record.
   */
  * insert(props) {
    yield this._insert(props);
  }

}



module.exports = AclModel;
