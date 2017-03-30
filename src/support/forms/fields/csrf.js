


const waigo = global.waigo,
  _ = waigo._,
  viewObjects = waigo.load('support/viewObjects'),
  HiddenField = waigo.load('support/forms/fields/hidden')



const checkCSRF = function*(context, field, value) {
  try {
    context.assertCSRF(value)
  } catch (err) {
    throw new Error('CSRF token check failed')
  }
}



/**
 * A Cross-site request forgery prevention field.
 */
class Csrf extends HiddenField {
  /**
   * Construct.
   * 
   * @param  {Form} form   Parent form
   * @param  {Object} config Configuration options
   * @constructor
   */
  constructor (form, config) {
    super(form, config)

    this._addValidator(checkCSRF)
  }
}


/**
 * @override
 */
Csrf.prototype[viewObjects.METHOD_NAME] = function*(ctx) {
  const ret = yield HiddenField.prototype[viewObjects.METHOD_NAME].call(this, ctx)

  ret.value = ctx.csrf

  return ret
}



module.exports = Csrf

