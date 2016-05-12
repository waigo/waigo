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

  let pkFound = false;

  // return columns as array of objects, each object defining column properties
  let columns = _.map(schema, function(def, name) {
    pkFound = ('id' === model.pk);

    return {
      type: 'Object', /* for now! */
      name: name,
    };
  });

  if (!pkFound) {
    columns.push({
      type: 'String',
      name: models.pk,
    });
  }

  yield this.render('/admin/models/columns', {
    columns: columns
  });
};



exports.rows = function*() {
  let modelName = this.request.body.name,
    filter = this.request.body.filter,
    excludeIds = JSON.parse(this.request.body.excludeIds),
    sort = this.request.body.sort,
    limit = parseInt(this.request.body.perPage),
    page = parseInt(this.request.body.page);

  this.logger.debug('get rows', modelName);

  let model = this.models[modelName];

  if (!model) {
    this.throw('Unable to find model', 404);
  }

  // get count
  let countQry = model.rawQry();

  if (filter && filter.length) {
    countQry = countQry.filter(new Function('row', filter));
  }
  
  let count = yield countQry.count().run();

  // get rows
  let rowsQry = model.rawQry();

  if (filter && filter.length) {
    rowsQry = rowsQry.filter(new Function('row', filter));
  }

// TODO: excluded ids
  // if (excludeIds && excludeIds.length) {
  //   let r = yield model.db;

  //   rowsQry = rowsQry.filter(function(row) {
  //     return r.expr(excludeIds).contains(row('id')).not();
  //   })
  // }

  if (sort && sort.length) {
    rowsQry = rowsQry.orderBy(sort)
  }

  rowsQry = rowsQry.limit(limit).skip((page - 1) * limit);

  let rows = yield rowsQry.run();

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
  let row = yield model.get(rowId);

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

  let model = this.models[modelName];

  // don't allow id to be updated
  if (doc.id) {
    this.throw('Cannot override primary key', 403);
  }

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
  yield model.rawUpdatre(rowId, doc);

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
  yield model.rawRemove(rowId);

  // record activity
  this.app.events.emit('record', 'delete_doc', this.currentUser, {
    model: modelName,
    id: rowId
  });

  this.body = {
    success: true
  };
};



