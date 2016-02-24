"use strict";


const compose = require('generator-compose');

const waigo = global.waigo,
  _ = waigo._,
  errors = waigo.load('support/errors'),
  FieldExports = waigo.load('support/forms/field'),
  Field = FieldExports.Field,
  viewObjects = waigo.load('support/viewObjects');


exports.Field = FieldExports.Field;



/** Form validation error. */
const FormValidationError = exports.FormValidationError = 
  errors.define('FormValidationError', errors.MultipleError);




// the form spec cache
var cache = {};



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
 * @param {Boolean} [options.submitted] Form instance is being created to handle a submission.
 */
exports.create = function*(config, options) {
  if (_.isString(config)) {
    let cachedSpec = cache[config];

    if (!cachedSpec) {
      cache[config]  = cachedSpec = waigo.load('forms/' + config);
      cachedSpec.id = config;
    }

    config = cachedSpec;    
  }

  let f = new Form(config, options);

  yield f.runHook('postCreation');

  return f;
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
      submitted: false,
    }, options);

    if (config instanceof Form) {
      // passed-in state overrides existing form's state
      options.state = options.state || config.state;  
      config = config.config;
    }

    this.config = _.extend({}, config);

    this.context = options.context;
    this.logger = this.context.app.logger.create('Form[' + this.config.id + ']');

    // CSRF enabled?
    if (!!_.get(this.context, 'assertCSRF')) {
      this.logger.debug('Adding CSRF field');

      this.config.fields.push({
        name: '__csrf',
        label: 'CSRF',
        type: 'csrf'
      });
    }

    // setup fields
    this._fields = {}
    for (let idx in this.config.fields) {
      let def = this.config.fields[idx];
      this._fields[def.name] = Field.new(this, def);
    }

    // initial state
    this.state = _.extend({}, options.state);    
  }

  get fields () {
    return this._fields;
  }

  get state () {
    return this._state;
  }

  /**
   * Set new state.
   *
   * @param {Object} newState New state.
   */
  set state (newState) {
    this._state = newState;

    for (let fieldName in this.fields) {
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
    for (let fieldName in this.fields) {
      yield this.fields[fieldName].setSanitizedValue(values[fieldName]);
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
    for (let fieldName in this.fields) {
      this.fields[fieldName].originalValue = values[fieldName];
    }
  }


  /** 
   * Get whether this form is dirty.
   * 
   * @return {Boolean} True if any fields are dirty; false otherwise.
   */
  isDirty () {
    for (let fieldName in this.fields) {
      if (this.fields[fieldName].isDirty()) {
        return true;
      }
    }

    return false;
  }


  /**
   * Validate the contents of this form.
   *
   * @throws FormValidationError If validation fails.
   */
  * validate () {
    let fields = this.fields,
      errors = null;

    for (let fieldName in fields) {
      let field = fields[fieldName];

      try {
        yield field.validate(this.context);
      } catch (err) {
        if (!errors) {
          errors = {}
        }

        errors[fieldName] = err.details;
      }
    }

    if (errors) {
      throw new FormValidationError('Please correct the errors in the form.', 400, errors);
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
    let body = _.get(this.context, 'request.body');

    if (!body) {
      throw new FormValidationError('No request body available to process');
    }

    yield this.setValues(body);
    yield this.validate();
    yield this.runHook('postValidation');
  }




  /**
   * Run hooks.
   *
   * @param {String} hookName Hooks to run.
   */
  * runHook (hookName) {
    yield compose(this.config[hookName] || []).call(this);
  }

}


/**
 * Get renderable representation of this form.
 *
 * @return {Object} Renderable plain object representation.
 */
Form.prototype[viewObjects.METHOD_NAME] = function*(ctx) {
  let fields = this.fields,
    fieldViewObjects = {},
    fieldOrder = [];

  for (let fieldName in fields) {
    let field = fields[fieldName];
      
    fieldViewObjects[fieldName] = yield field[viewObjects.METHOD_NAME](ctx);
    fieldOrder.push(fieldName);
  }

  let ret = {
    fields: fieldViewObjects,
    order: fieldOrder,
    method: this.config.method,
  }

  if (this.config.id) {
    ret.id = this.config.id
  }

  return ret;
}




