

exports.index = function*() {
  yield this.render('admin/emails', {
    menu: this.app.config.adminMenu,
  });
};

