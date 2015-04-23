"use strict";


exports.main = function*() {
  yield this.render('admin/index', {
    menu: this.app.config.adminMenu,
  });
};

