"use strict";

var waigo = require('../../../'),
  _ = waigo._;



exports.index = function*() {
  yield this.render('admin/cron', {
    tasks: this.app.cron
  });
};




exports.run = function*() {
  var name = this.request.body.name;

  yield this.app.cron[name].runNow();

  yield this.render('admin/cron/run');
};

