var _ = require('lodash'),
  async = require('async');

var loader = require('../../../../loader'),
  errorTypes = loader.require('support/errors'),
  FormField = loader.require('lib/forms/field');



/**
 * Create a text field.
 *
 * @constructor
 */
// TODO: unit test
var TextField = function() {
  FormField.apply(this, _.toArray(arguments));
};
TextField.inheritsFrom(FormField);



// -----------------------------------------------------
// STATICS
// -----------------------------------------------------

/**
 * Text field validators.
 *
 * @see FormField.Validators
 */
// TODO: unit test
TextField.Validators = {

};


// -----------------------------------------------------
// EXPORTS
// -----------------------------------------------------


module.exports = TextField;