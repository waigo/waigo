const validator = require('validator')

const waigo = global.waigo,
  FieldExports = waigo.load('forms/support/field'),
  Field = FieldExports.Field



/**
 * A select field.
 */
class Checkbox extends Field {
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
        return value ? validator.toBoolean('' + value) : false
      }
    )
  }
}


module.exports = Checkbox
