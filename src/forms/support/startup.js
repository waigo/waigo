const waigo = global.waigo


/**
 * Setup forms.
 * @param {App} App  The application.
 */
module.exports = function *(App) {
  App.logger.debug('Setting up forms')

  App.form = waigo.load('forms/support/form')
}
