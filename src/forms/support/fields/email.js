const waigo = global.waigo,
  TextField = waigo.load('forms/support/fields/text')




/**
 * A select field.
 */
class Email extends TextField {
  /**
   * Construct.
   * @param  {Form} form   Parent form
   * @param  {Object} config Configuration options
   * @constructor
   */
  constructor (form, config) {
    super(form, config)

    this._addValidator('isEmailAddress')
  }
}



module.exports = Email
