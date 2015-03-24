"use strict";

var waigo = require('../../../'),
  _ = waigo._;


exports.index = function*() {
  yield this.render('admin/models/index', {
    models: _.keys(this.app.models),
  });
};



exports.columns = function*() {
  var modelName = this.request.query.name;

  this.app.logger.debug('get columns', modelName);

  // iterate through schema
  var model = this.app.models[modelName],
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

  this.app.logger.debug('get rows', modelName);

  var model = this.app.models[modelName],
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

  this.app.logger.debug('get doc', modelName, rowId);

  var model = this.app.models[modelName];

  // get data
  var row = yield model.findOne({
    _id: rowId
  });

  yield this.render('/admin/models/doc', {
    doc: row
  });
};





