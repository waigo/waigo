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

  var task = this.app.cron[name];

  yield task.runNow();

  yield this.render('admin/cron/run', {
    task: task,
  });
};




exports.updateStatus = function*() {
  var name = this.request.body.name,
    active = this.request.body.active;

  active = ('true' === ('' + active));

  var task = this.app.cron[name];

  yield task.setActive(active);

  yield this.render('admin/cron/updateStatus', {
    task: task,
  });
};


