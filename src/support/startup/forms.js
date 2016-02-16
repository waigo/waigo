"use strict";


var waigo = global.waigo,
  _ = waigo._;


/** 
 * Setup forms.
 * @param {App} app  The application.
 */
module.exports = function*(app) {
  app.logger.debug('Setting up forms');

  app.form = waigo.load('support/forms/form');
};




