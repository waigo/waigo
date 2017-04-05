const waigo = global.waigo,
  TextField = waigo.load('forms/support/fields/text')




/**
 * A select field.
 */
class NumberField extends TextField {
  /**
   * Construct.
   * @param  {Form} form   Parent form
   * @param  {Object} config Configuration options
   * @constructor
   */
  constructor (form, config) {
    super(form, config)

    this._addSanitizer(
      function *(field, value) {
        return Number(value)
      }
    )
  }
}



module.exports = NumberField
