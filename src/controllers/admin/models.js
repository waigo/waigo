"use strict";

var waigo = require('../../../'),
  _ = waigo._;



exports.index = function*() {
  yield this.render('admin/models/list', {
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
  var modelName = this.request.query.name;

  this.logger.debug('get rows', modelName);

  var model = this.models[modelName],
    listViewColumns = _.get(model, 'options.admin.listView');

  // [a,b,c] => {a:1, b:1, c:1}
  var fieldsToInclude = {};
  _.each(listViewColumns, function(c) {
    var name = c.name || c;

    fieldsToInclude[name] = 1;
  });
  fieldsToInclude._id = 1;  // always include _id field

  // get data
  var rows = yield model.find({}, {
    fields: fieldsToInclude,
    sort: {
      _id: 1,
    },
  });

  yield this.render('/admin/models/rows', {
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
    doc: row
  });
};





exports.docUpdate = function*() {
  var modelName = this.request.query.name,
    rowId = this.request.query.id;

  this.logger.debug('update doc', modelName, rowId);

  var doc = this.request.body.doc;

  if (_.isEmpty(doc)) {
    this.throw('Cannot update to an empty document', 403);
  }

  // don't allow _id to be updated
  if (doc._id) {
    this.throw('Cannot update _id', 403);
  }

  var model = this.models[modelName];

  // update data
  yield model.update({
    _id: rowId
  }, doc);

  this.body = {
    success: true
  };
};



