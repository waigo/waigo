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
    columnNames = _.get(model, 'options.admin.listView', []);

  var columns = columnNames.map(function(c) {
    return {
      name: c,
      // if we can't get figure out column type then assume it's a string
      type: _.get(schema[c], 'type', String),
    }
  });

  yield this.render('/admin/models/columns', {
    columns: columns
  });
};



exports.rows = function*() {
  var modelName = this.request.query.name;

  this.app.logger.debug('get rows', modelName);

  var model = this.app.models[modelName],
    columnNames = _.get(model, 'options.admin.listView');

  // [a,b,c] => {a:1, b:1, c:1}
  var fieldsToInclude = {};
  _.each(columnNames, function(c) {
    fieldsToInclude[c] = 1;
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




