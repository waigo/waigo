"use strict";


var waigo = require('../../../'),
  _ = waigo._;


/**
 * Middleware method to configure menu for rendering.
 */
exports.configureMenu = function*(next) {
  var user = this.currentUser;

  var menu = this.app.config.adminMenu,
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

  this.app.locals.adminMenu = finalMenu;    

  yield next;
};




exports.main = function*() {
  yield this.render('admin/index');
};




