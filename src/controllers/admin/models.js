"use strict";

var waigo = require('../../../'),
  _ = waigo._;


exports.index = function*() {
  yield this.render('admin/models/index', {
    models: _.keys(this.app.models),
  });
};
