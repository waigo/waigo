"use strict";

const waigo = global.waigo,
  _ = waigo._,
  Field = waigo.load('support/forms/field').Field;




/**
 * A text field.
 */
class Text extends Field {
  /**
   * Construct.
   * @param  {Form} form   Parent form
   * @param  {Object} config Configuration options
   * @constructor
   */
  constructor (form, config) {
    super(form, config);
  }
}


module.exports = Text;


