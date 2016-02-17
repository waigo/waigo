"use strict";

const waigo = global.waigo,
  _ = waigo._;



exports.index = function*() {
  let routes = this.app.routes.all;

  yield this.render('admin/routes', {
    routes: _.map(routes, function(route) {
      return _.pick(route, 'method', 'url');
    })
  });
};


