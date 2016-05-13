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

  let columns = [];

  let pkFound = false;

  _.each(schema, (def, name) => {
    pkFound = (model.pk === name);

    if (!_.get(def, 'adminViewOptions.hide')) {
      let type = def.type;

      switch (def.type) {
        case String:
        case Boolean:
        case Date:
        case Number:
        case Object:
        case Array:
          break;
        default:
          if (def.type instanceof Array) {
            type = Array;
          } else {
            type = Object;
          }
          break;
      }

      columns.push({
        type: type,
        name: name,
        options: def.adminViewOptions,
      });
    }
  });

  if (!pkFound) {
    columns.unshift({
      type: 'String',
      name: model.pk,
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

  if (sort && sort.length) {
    rowsQry = rowsQry.orderBy(sort)
  }

  rowsQry = rowsQry.limit(limit).skip((page - 1) * limit);

  let rows = yield rowsQry.run();

  if (excludeIds && excludeIds.length) {
    rows = _.filter(rows, (row) => {
      return !_.includes(excludeIds, row.id);
    });
  }

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

  doc = model.schema.typeify(doc, {
    limitTypes: [Date]
  });

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

  doc = model.schema.typeify(doc, {
    limitTypes: [Date]
  });

  // update data
  yield model.rawUpdate(rowId, doc);

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



