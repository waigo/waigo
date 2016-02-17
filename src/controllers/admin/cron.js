"use strict";

const waigo = global.waigo,
  _ = waigo._;



exports.index = function*() {
  yield this.render('admin/cron', {
    tasks: this.app.cron
  });
};




exports.run = function*() {
  let name = this.request.body.name;

  let task = this.app.cron[name];

  yield task.runNow();

  yield this.render('admin/cron/run', {
    task: task,
  });
};




exports.updateStatus = function*() {
  let name = this.request.body.name,
    active = this.request.body.active;

  active = ('true' === ('' + active));

  let task = this.app.cron[name];

  yield task.setActive(active);

  yield this.render('admin/cron/updateStatus', {
    task: task,
  });
};


