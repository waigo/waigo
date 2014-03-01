/*
Base class for fields.
 */

var _ = require('lodash'),
  Promise = require('bluebird'),
  waigo = require('../../../../');


/**
 * Create a form field.
 *
 * @param name {String} field name.
 * @param config {Object} field config.
 * @constructor
 */
var Field = function(name, config) {
  var self = this;

  self.name = name;
  self.config = config;
  self.value = undefined;

  self._validators = [];
  _.each(self.config.validators, function(v) {
    self.addValidator(waigo.load('support/validators/forms/fields/' + v));
  });
};


/**
 * Set the value of this field.
 *
 * @param val {*} the value.
 * @param cb {Function} callback.
 *
 * @return {Promise}
 */
Field.prototype.setValue = function(val, cb) {
  return Promise.reject(new Error('Not yet implemented')).nodeify(cb);
};



/**
 * Get render-able representation of this field.
 *
 * @param cb {Function} callback
 *
 * @return {Promise}
 */
Field.prototype.toViewObject = function(cb) {
  var self = this;

  var viewObject = _.extend({}, self.config);

  if (self.value) {
    viewObject.value = self.value;
  }

  return Promise.resolve(viewObject).nodeify(cb);
};


/**
 * Add a validator to this field.
 *
 * @param validator {Object} the validator to add.
 */
Field.prototype.addValidator = function(validator) {
  this._validators.push(validator);
};



/**
 * Validate this field's current value.
 *
 * @param cb {Function} callback
 *
 * @return {Promise}
 */
Field.prototype.validate = function(cb) {
  var self = this;

  var errors = [];

  async.forEachSeries(self._validators, function(validatorFn, done) {
    validatorFn.call(null, self, function (err) {
      if (err) {
        errors.push(err);
      }

      done();
    });
  }, function(/*err*/) {
    var err = undefined;

    // any errors
    if (0 < errors.length) {
      // more than 1 error?
      if (1 < errors.length) {
        err = new errorTypes.MultipleError(errors);
      }
      // just one
      else {
        err = errors[0];
      }
    }

    cb(err);
  });
};




// -----------------------------------------------------
// STATICS
// -----------------------------------------------------

/**
 * Default field validators.
 */
// TODO: unit test
Field.Validators = {
  /**
   * Check that the field's value is set.
   *
   * @param {Field} field
   * @param {Function} cb(err)
   */
  // TODO: unit test
  isRequired: function(field, cb) {
    if (!field.value || '' === field.value) return cb(new Error('a value is required'));

    cb();
  }
};



/**
 * Create a new field.
 *
 * @param {String} fieldName
 * @param {Object} fieldSpec
 * @param {Function} cb(err, Field)
 */
// TODO: unit test
Field.new = function(fieldName, fieldSpec, cb) {
  var fieldClass = loader.require('lib/forms/fields/' + fieldSpec.type);

  cb(null, new fieldClass(fieldName, fieldSpec));
};



// -----------------------------------------------------
// EXPORTS
// -----------------------------------------------------


module.exports = Field;