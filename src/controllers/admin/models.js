"use strict";

var waigo = require('../../../'),
  _ = waigo._;



exports.index = function*() {
  yield this.render('admin/models', {
    menu: this.app.config.adminMenu,
    models: _.keys(this.app.models),
  });
};




exports.columns = function*() {
  var modelName = this.request.query.name;

  this.logger.debug('get columns', modelName);

  // iterate through schema
  var model = this.models[modelName],
    schema = _.get(model, 'options.schema', {}),
    listViewColumns = _.get(model, 'options.admin.listView', []);

  // return columns as array of objects, each object defining column properties
  var columns = listViewColumns.map(function(c) {
    if (!c.name) {
      c = {
        name: c
      }
    }

    c.type = _.get(schema[c.name], 'type', String);

    return c;
  });

  yield this.render('/admin/models/columns', {
    columns: columns
  });
};



exports.rows = function*() {
  var modelName = this.request.body.name,
    filter = JSON.parse(this.request.body.filter),
    sort = JSON.parse(this.request.body.sort),
    limit = parseInt(this.request.body.perPage),
    page = parseInt(this.request.body.page);

  this.logger.debug('get rows', modelName);

  var model = this.models[modelName],
    listViewColumns = _.get(model, 'options.admin.listView');

  if (!model) {
    this.throw('Unable to find model', 404);
  }

  // [a,b,c] => {a:1, b:1, c:1}
  var fieldsToInclude = {};
  _.each(listViewColumns, function(c) {
    var name = c.name || c;

    fieldsToInclude[name] = 1;
  });
  fieldsToInclude._id = 1;  // always include _id field

  // get count
  var count = yield model.count(filter);

  // get data
  var rows = yield model.find(filter, {
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
  var modelName = this.request.query.name,
    rowId = this.request.query.id;

  this.logger.debug('get doc', modelName, rowId);

  var model = this.models[modelName];

  // get data
  var row = yield model.findOne({
    _id: rowId
  });

  yield this.render('/admin/models/doc', {
    doc: JSON.stringify(row)
  });
};




exports.docCreate = function*() {
  var modelName = this.request.query.name;

  this.logger.debug('create doc', modelName);

  var doc = JSON.parse(this.request.body.doc);

  if (_.isEmpty(doc)) {
    this.throw('Cannot create an empty document', 403);
  }

  // don't allow _id to be updated
  if (doc._id) {
    this.throw('Cannot override _id', 403);
  }

  var model = this.models[modelName];

  doc = model.schema.typeify(doc);

  // update data
  var newDoc = yield model.insert(doc);

  // record activity
  yield this.app.record('insert_doc', this.currentUser, {
    model: modelName,
    _id: newDoc._id
  });

  this.body = {
    doc: JSON.stringify(newDoc)
  };
};





exports.docUpdate = function*() {
  var modelName = this.request.query.name,
    rowId = this.request.query.id;

  this.logger.debug('update doc', modelName, rowId);

  var doc = JSON.parse(this.request.body.doc);

  if (_.isEmpty(doc)) {
    this.throw('Cannot update to an empty document', 403);
  }

  // don't allow _id to be updated
  delete doc._id;

  var model = this.models[modelName];

  doc = model.schema.typeify(doc);

  // update data
  yield model.update({
    _id: rowId
  }, doc);

  // record activity
  yield this.app.record('update_doc', this.currentUser, {
    model: modelName,
    _id: doc._id
  });

  this.body = {
    success: true
  };
};




exports.docDelete = function*() {
  var modelName = this.request.query.name,
    rowId = this.request.query.id;

  this.logger.debug('delete doc', modelName, rowId);

  var model = this.models[modelName];

  // delete data
  yield model.remove({
    _id: rowId
  });

  // record activity
  yield this.app.record('delete_doc', this.currentUser, {
    model: modelName,
    _id: rowId
  });

  this.body = {
    success: true
  };
};



