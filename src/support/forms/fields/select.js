


const waigo = global.waigo,
  _ = waigo._,
  errors = waigo.load('support/errors'),
  viewObjects = waigo.load('support/viewObjects'),
  FieldExports = waigo.load('support/forms/field'),
  Field = FieldExports.Field, 
  FieldValidationError = FieldExports.FieldValidationError;



const _arrayToStr = function(arr) {
  return _.map(arr, function(v) {
    return '' + v;
  });
}



/**
 * A select field.
 */
class Select extends Field {
  /**
   * Construct.
   * @param  {Form} form   Parent form
   * @param  {Object} config Configuration options
   * @constructor
   */
  constructor(form, config) {
    super(form, config);

    // default validator
    this._addValidator(
      function*(context, field, val) {
        let options = yield field.getOptions();

        if (!_.isArray(val)) {
          val = [val];
        }

        val = _arrayToStr(val);
        let expected = _arrayToStr(_.keys(options));

        let diff = _.difference(val, expected);
        
        // if unknown option given OR if more than one given for a non-multiple select
        if (diff.length || (1 < val.length && !field.config.multiple)) {
          let str = field.config.multiple ? 'one or more of' : 'one of';

          throw new FieldValidationError(`Must be ${str}: ${_.values(options).join(', ')}`);
        }
      }
    );
  }

  /**
   * Get selectable options to show to user.
   *
   * @return {Object} key-value pairs representing options.
   */
  * getOptions () {
    if (this.config.options instanceof Function) {
      return yield this.config.options();
    } else {
      return this.config.options;
    }
  }
}



/**
 * @override
 */
Select.prototype[viewObjects.METHOD_NAME] = function*(ctx) {
  let ret = yield Field.prototype.toViewObject.call(this, ctx);

  ret.options = yield this.getOptions();

  return ret;
};



module.exports = Select;



