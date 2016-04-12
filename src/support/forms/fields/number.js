"use strict";


const validator = require('validator');

const waigo = global.waigo,
  _ = waigo._,
  TextField = waigo.load('support/forms/fields/text');




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
  constructor(form, config) {
    super(form, config);

    this._addSanitizer(
      function*(field, value) {
        return Number(value);
      }
    )
  }
}


module.exports = NumberField;



