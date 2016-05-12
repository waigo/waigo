"use strict";

const waigo = global.waigo,
  _ = waigo._;



exports.index = function*() {
  yield this.render('admin/models', {
    models: _.keys(this.app.models),
  });
};




exports.columns = function*() {
  let modelName = this.request.query.name;

  this.logger.debug('get columns', modelName);

  // iterate through schema
  let model = this.models[modelName],
    schema = model._cfg.schema;

  // return columns as array of objects, each object defining column properties
  let columns = _.map(schema, function(def, name) {
    return {
      type: def.type,
      name: c
    };
  });

  yield this.render('/admin/models/columns', {
    columns: columns
  });
};



exports.rows = function*() {
  let modelName = this.request.body.name,
    filter = JSON.parse(this.request.body.filter),
    excludeIds = JSON.parse(this.request.body.excludeIds),
    sort = JSON.parse(this.request.body.sort),
    limit = parseInt(this.request.body.perPage),
    page = parseInt(this.request.body.page);

  this.logger.debug('get rows', modelName);

  let model = this.models[modelName];

  if (!model) {
    this.throw('Unable to find model', 404);
  }

  const listViewColumns = _.keys(model._cfg.schema);

  // [a,b,c] => {a:1, b:1, c:1}
  let fieldsToInclude = {};
  _.each(listViewColumns, function(c) {
    fieldsToInclude[c] = 1;
  });
  fieldsToInclude.id = 1;  // always include id field

  // exclude certain ids?
  if (excludeIds && excludeIds.length) {
    filter = {
      $and: [
        filter, {
          id: {
            $nin: excludeIds.map(function(id) {
              return id;
            })
          }
        }
      ]
    };
  }

  // get count
  let count = yield model.count(filter);

  // get data
  let rows = yield model.find(filter, {
    fields: fieldsToInclude,
    sort: sort,
    limit: limit,
    skip: ((page - 1) * limit),
  });

  yield this.render('/admin/models/rows', {
    count: count,
    rows: rows
  });
};



exports.doc = function*() {
  let modelName = this.request.query.name,
    rowId = this.request.query.id;

  this.logger.debug('get doc', modelName, rowId);

  let model = this.models[modelName];

  // get data
  let row = yield model.getById(rowId);

  yield this.render('/admin/models/doc', {
    doc: JSON.stringify(row)
  });
};




exports.docCreate = function*() {
  let modelName = this.request.query.name;

  this.logger.debug('create doc', modelName);

  let doc = JSON.parse(this.request.body.doc);

  if (_.isEmpty(doc)) {
    this.throw('Cannot create an empty document', 403);
  }

  // don't allow id to be updated
  if (doc.id) {
    this.throw('Cannot override id', 403);
  }

  let model = this.models[modelName];

  doc = model.schema.typeify(doc);

  // update data
  let newDoc = yield model.insert(doc);

  // record activity
  this.app.events.emit('record', 'insert_doc', this.currentUser, {
    model: modelName,
    id: newDoc.id
  });

  this.body = {
    doc: JSON.stringify(newDoc)
  };
};





exports.docUpdate = function*() {
  let modelName = this.request.query.name,
    rowId = this.request.query.id;

  this.logger.debug('update doc', modelName, rowId);

  let doc = JSON.parse(this.request.body.doc);

  if (_.isEmpty(doc)) {
    this.throw('Cannot update to an empty document', 403);
  }

  // don't allow id to be updated
  delete doc.id;

  let model = this.models[modelName];

  doc = model.schema.typeify(doc);

  // update data
  yield model.update({
    id: rowId
  }, doc);

  // record activity
  this.app.events.emit('record', 'update_doc', this.currentUser, {
    model: modelName,
    id: rowId
  });

  this.body = {
    success: true
  };
};




exports.docDelete = function*() {
  let modelName = this.request.query.name,
    rowId = this.request.query.id;

  this.logger.debug('delete doc', modelName, rowId);

  let model = this.models[modelName];

  // delete data
  yield model.remove({
    id: rowId
  });

  // record activity
  this.app.events.emit('record', 'delete_doc', this.currentUser, {
    model: modelName,
    id: rowId
  });

  this.body = {
    success: true
  };
};



