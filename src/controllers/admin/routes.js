"use strict";

var waigo = require('../../../'),
  _ = waigo._;


exports.index = function*() {
  var routes = this.app.routeMappings;

  yield this.render('admin/routes/index', {
    routes: _.map(routes, function(route) {
      return _.pick(route, 'method', 'url');
    })
  });
};
