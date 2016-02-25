"use strict";

const waigo = global.waigo,
  _ = waigo._;



exports.index = function*() {
  yield this.render('admin/cron', {
    tasks: this.app.cron
  });
};




exports.run = function*() {
  let id = this.request.body.id;

  let task = this.app.cron[id];

  yield task.runNow();

  yield this.render('admin/cron/run', {
    task: task,
  });
};




exports.updateStatus = function*() {
  let id = this.request.body.id,
    active = this.request.body.active;

  active = ('true' === ('' + active));

  let task = this.app.cron[id];

  yield task.setActive(active);

  yield this.render('admin/cron/updateStatus', {
    task: task,
  });
};


