


const compose = require('generator-compose')

const waigo = global.waigo,
  _ = waigo._,
  logger = waigo.load('support/logger'),
  errors = waigo.load('support/errors'),
  FieldExports = waigo.load('support/forms/field'),
  Field = FieldExports.Field,
  viewObjects = waigo.load('support/viewObjects')


exports.Field = FieldExports.Field



/** Form validation error. */
const FormValidationError = exports.FormValidationError = 
  errors.define('FormValidationError', errors.MultipleError)




// the form spec cache
const cache = {}



/**
 * Construct a form.
 *
 * Form field values get stored in an internal state object which can be retrieved 
 * and set at any time, thus allowing you to share state between `Form` instances 
 * as well as quickly restore a `Form` to a previously set state.
 *
 * Constructing a form using this function rather than the `Form` constructor will 
 * also ensure that the `postCreation` hooks get run.
 * 
 * @param {Object|String|Form} config form configuration,  name of a form, or an existing `Form`.
 * @param {Object} [options] Additional options.
 * @param {Object} [options.context] The current request context.
 * @param {Object} [options.state] The internal state to set for this form.
 */
exports.create = function *(config, options) {
  if (_.isString(config)) {
    const cachedSpec = cache[config]

    if (!cachedSpec) {
      cache[config]  = cachedSpec = waigo.load('forms/' + config)
      cachedSpec.id = config
    }

    config = cachedSpec    
  }

  const f = new Form(config, options)

  yield f.runHook('postCreation')

  return f
}




class Form {
  /**
   * Construct a form.
   *
   * Form field values get stored in an internal state object which can be retrieved 
   * and set at any time, thus allowing you to share state between `Form` instances 
   * as well as quickly restore a `Form` to a previously set state.
   *
   * @param {Object|Form} config form configuration,  name of a form, or an existing `Form`.
   * @param {Object} [options] Additional options.
   * @param {Object} [options.context] The current request context.
   * @param {Object} [options.state] The internal state to set for this form.
   * 
   * @constructor
   */
  constructor (config, options) {
    options = _.extend({
      context: null,
      state: null,
    }, options)

    if (config instanceof Form) {
      // passed-in state overrides existing form's state
      options.state = options.state || config.state  
      config = config.config
    }

    this.config = _.extend({}, config)

    this.context = options.context
    this.logger = logger.create('Form[' + this.config.id + ']')

    // setup fields
    this._fields = {}
    for (const idx in this.config.fields) {
      const def = this.config.fields[idx]
      this._fields[def.name] = Field.new(this, def)
    }

    // CSRF enabled (set by koa-csrf package)?
    if (!!_.get(this.context, 'assertCSRF')) {
      this.logger.debug('Adding CSRF field')

      this._fields.__csrf = Field.new(this, {
        name: '__csrf',
        label: 'CSRF',
        type: 'csrf',
        required: true,
      })
    }

    // initial state
    this.state = _.extend({}, options.state)    
  }

  get fields () {
    return this._fields
  }

  get state () {
    return this._state
  }

  /**
   * Set new state.
   *
   * @param {Object} newState New state.
   */
  set state (newState) {
    this._state = newState

    for (const fieldName in this.fields) {
      this._state[fieldName] = this._state[fieldName] || {
        value: undefined
      }
    }
  }

  /**
   * Set values.
   *
   * This will sanitize each value prior to setting it.
   *
   * @param {Object} values Mapping from field name to field value.
   */
  * setValues (values) {
    for (const fieldName in this.fields) {
      yield this.fields[fieldName].setSanitizedValue(values[fieldName])
    }
  }


  /**
   * Set original values.
   *
   * _Note: unlike when setting the current field values these values do not 
   * get sanitized._
   * 
   * @param {Object} values Mapping from field name to field original value.
   */
  * setOriginalValues (values) {
    for (const fieldName in this.fields) {
      this.fields[fieldName].originalValue = values[fieldName]
    }
  }


  /** 
   * Get whether this form is dirty.
   * 
   * @return {Boolean} True if any fields are dirty false otherwise.
   */
  isDirty () {
    for (const fieldName in this.fields) {
      if (this.fields[fieldName].isDirty()) {
        return true
      }
    }

    return false
  }


  /**
   * Validate the contents of this form.
   *
   * @throws FormValidationError If validation fails.
   */
  * validate () {
    const fields = this.fields,
      errors = null

    for (const fieldName in fields) {
      const field = fields[fieldName]

      try {
        yield field.validate(this.context)
      } catch (err) {
        if (!errors) {
          errors = {}
        }

        errors[fieldName] = err.details
      }
    }

    if (errors) {
      throw new FormValidationError('Please correct the errors in the form.', 400, errors)
    }
  }



  /**
   * Process this submitted form.
   *
   * This will insert values from the current context request body and run 
   * all sanitization and validation. If validation succeeds then post-validation
   * hooks will be run.
   */
  * process () {
    const body = _.get(this.context, 'request.body')

    if (!body) {
      throw new FormValidationError('No request body available to process')
    }

    yield this.setValues(body)
    yield this.validate()
    yield this.runHook('postValidation')
  }




  /**
   * Run hooks.
   *
   * @param {String} hookName Hooks to run.
   */
  * runHook (hookName) {
    yield compose(this.config[hookName] || []).call(this)
  }

}

exports.Form = Form


/**
 * Get renderable representation of this form.
 *
 * @return {Object} Renderable plain object representation.
 */
Form.prototype[viewObjects.METHOD_NAME] = function *(ctx) {
  const ret = _.omit(this.config, 'fields', 'postValidation')

  const fields = this.fields,
    fieldViewObjects = {},
    fieldOrder = []

  for (const fieldName in fields) {
    const field = fields[fieldName]
      
    fieldViewObjects[fieldName] = yield field[viewObjects.METHOD_NAME](ctx)
    fieldOrder.push(fieldName)
  }

  ret.fields = fieldViewObjects
  ret.order = fieldOrder

  return ret
}




