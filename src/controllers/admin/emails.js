exports.index = function*() {
  yield this.render('admin/models', {
    menu: this.app.config.adminMenu,
    templates: _.keys(this.app.models),
  });
};

