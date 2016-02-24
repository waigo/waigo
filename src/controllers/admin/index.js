"use strict";


const waigo = global.waigo,
  _ = waigo._;


/**
 * Middleware method to configure menu for rendering.
 */
exports.configureMenu = function*(next) {
  let user = this.currentUser;

  let menu = this.app.config.adminMenu,
    finalMenu = [];

  for (let item, i=0; menu.length>i; ++i) {
    item = menu[i];

    if (item.canAccess) {
      if ( yield user.canAccess(item.canAccess) ) {
        finalMenu.push(item);
      }
    } else {
      finalMenu.push(item);
    }
  }

  this.app.templateVars.adminMenu = finalMenu;    

  yield next;
};




exports.main = function*() {
  yield this.render('admin/index');
};




