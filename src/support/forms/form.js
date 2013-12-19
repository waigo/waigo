var _ = require('lodash'),
  waigo = GLOBAL.waigo,
  Promise = require('bluebird'),
  errorTypes = waigo.require('support.errors'),
  Field = waigo.require('support.forms.field');



/**
 * Construct a form.
 *
 * @param config {Object} form configuration.
 * @constructor
 */
var Form = function(config) {
  this.config = config || {};
};



/**
 * Get the fields of this form.
 *
 * This will create the Field instances if not already done so.
 *
 * @param cb {Function} callback
 *
 * @return {Promise}
 */
Form.prototype.getFields = function(cb) {
  var self = this;

  return Promise.resolve(true)
    .then(function buildFields() {
      if (self._fields) {
        return;
      }

      self._fields = {};

      return Promise.props(
        _.mapValues(self.config.fields, function(fieldData, fieldName) {
          return Field.create(fieldName, fieldData);
        })
      )
        .then(function gotFields(fields) {
          self._fields = fields;
        });
    })
    .then(function built() {
      return self._fields;
    })
    .nodeify(cb)
  ;
};




/**
 * Set the current contents of the form fields.
 *
 * @param formContents {Object} field-value mappings
 * @param cb {Function} callback
 *
 * @return {Promise}
 */
Form.prototype.setContents = function(formContents, cb) {
  var self = this;

  formContents = formContents || {};

  return self.getFields()
    .then(function gotFields(fields) {
      return Promise.props(
        _.mapValues(fields, function(field, name) {
          return field.setValue(formContents[name]);
        })
      );
    })
    .nodeify(cb)
  ;
};



/**
 * Validate the contents of this form.
 *
 * If any errors occur this will return a FormValidationErrors object containing separate errors for each field which
 * failed to validate.
 *
 * @param cb {Function} callback
 *
 * @return {Promise}
 */
Form.prototype.validate = function(cb) {
  var self = this;

  var errors = null;

  return self.getFields(cb)
    .then(function gotFields(fields) {
      return Promise.all(
        _.map(fields, function(field, name) {
          var resolver = Promise.defer();

          field.validate()
            .catch(function (validationError) {
              if (!errors) {
                errors = {};
              }

              errors[name] = validationError;
            })
            .done(function() {
              resolver.resolve();
            });

          return resolver.promise;
        })
      );
    })
    .then(function checkErrors() {
      if (errors) {
        errors = new errorTypes.FormValidationErrors(errors);
      }

      return errors;
    })
    .nodeify(cb)
  ;
};




/**
 * Get render-able representation of this form.
 *
 * Output will include values for form fields.
 *
 * @param cb {Function} callback
 *
 * @return {Promise}
 */
Form.prototype.toViewObject = function(cb) {
  var self = this;

  return self.getFields(cb)
    .then(function gotFields(fields) {
      return Promise.props(
        _.mapValues(fields, function(field) {
          return field.toViewObject(cb);
        })
      );
    })
    .then(function gotFieldData(fieldViewObjects) {
      return {
        id: self.config.id,
        submitLabel: self.config.submitLabel || 'Submit',
        fields: fieldViewObjects
      };
    })
    .nodeify(cb);
};




// -----------------------------------------------------
// EXPORTS
// -----------------------------------------------------


module.exports = Form;
