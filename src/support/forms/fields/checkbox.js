"use strict";


const validator = require('validator');

const waigo = global.waigo,
  _ = waigo._,
  FieldExports = waigo.load('support/forms/field'),
  Field = FieldExports.Field;



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
  constructor(form, config) {
    super(form, config);

    this._addSanitizer(
      function*(field, value) {
        return value ? validator.toBoolean('' + value) : false;
      }
    )
  }
}


module.exports = Checkbox;



