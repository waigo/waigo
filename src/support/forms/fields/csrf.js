"use strict";


const waigo = global.waigo,
  _ = waigo._,
  viewObjects = waigo.load('support/viewObjects'),
  Field = waigo.load('support/forms/fields/hidden');



/**
 * A Cross-site request forgery prevention field.
 */
class Csrf extends Field {
  /**
   * Construct.
   * 
   * @param  {Form} form   Parent form
   * @param  {Object} config Configuration options
   * @constructor
   */
  constructor (form, config) {
    super(form, config);

    this._addValidator(
      function* checkCSRF(context, field, value) {
        try {
          context.assertCSRF(value);
        } catch (err) {
          throw new Error('Token check failed');
        }
      }
    );
  }
}


/**
 * @override
 */
Csrf.prototype[viewObjects.METHOD_NAME] = function*(ctx) {
  let ret = yield Field.prototype[viewObjects.METHOD_NAME].call(this, ctx);

  ret.type = 'hidden';
  ret.value = ctx.csrf;

  return ret;
};



module.exports = Csrf;

