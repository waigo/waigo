"use strict";

var waigo = require('../../../'),
  _ = waigo._;



exports.index = function*() {
  yield this.render('admin/cron', {
    tasks: app.cron
  });
};


