


const waigo = global.waigo,
  _ = waigo._;


/** 
 * Setup forms.
 * @param {App} App  The application.
 */
module.exports = function*(App) {
  App.logger.debug('Setting up forms');

  App.form = waigo.load('support/forms/form');
};




