# Field validators

Once [sanitizers](Sanitizers.md) have run the next step is field validation. This is where we ensure that submitted field values are within accepted ranges and do all other checks to ensure that the submitted data is actually valid.

Adding validation to our example user profile form:

```js
"use strict";

module.exports = {
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      sanitizers: ['trim'],
      validators: ['notEmpty', { id: 'isLength', min: 2 }]
    },
    {
      name: 'age',
      type: 'number',
      required: true,
      sanitizers: ['trim'],
      validators: [{ id: 'numberInRange', min: 1, max: 105 }]
    },
  ],
};
```

All validators are loaded from the `support/forms/validators` path. All the validators used above come with Waigo. 

The `notEmpty` validator checks to ensure the input value isn't `null`, `undefined` or an empty string (if it's a string). 

The `isLength` validator checks to ensure the input string has a length between `min` and `max` characters inclusive. We haven't supplied `max` above so that means the string does not have a max length.

The `numberInRange` validator is meant for use with number values and checks that the input number is between `min` and `max` inclusive. 

In order to pass the `min` and `max` parameters the validator had to be specified as an object - this object gets passed as a whole to the validator initializer function:

```js
// file: <waigo>/src/support/fields/validators/isLength.js
"use strict";

const waigo = global.waigo,
  _ = waigo._,
  FieldValidationError = waigo.load('support/forms/field').FieldValidationError;


module.exports = function(options) {
  options = _.extend({
    min: 0,
    max: 10000000,
  }, options);

  return function*(context, field, value) {
    let len = _.get(value, 'length', 0);
    let min = options.min;
    let max = options.max;

    if (min > len || max < len) {
      throw new FieldValidationError('Must be between ' 
        + options.min + ' and ' 
        + options.max + ' characters in length'
      );
    }
  }
};
```
*Note: Validators are implemented as generator methods, meaning they can perform asynchronous actions if needed!*

The validator function gets passed a reference to the associated field object as well as the parent form, thus allowing for complex validation logic. For example, the built-in [`compareToField` validator](https://github.com/waigo/waigo/blob/master/src/support/forms/validators/compareToField.js) checks to see if a field's value matches that of another field.


# Validation errors 

If validation fails then a `FieldValidationError` gets thrown by the validator which failed, as shown above. Even if a field fails to validate the remaining fields within a form still get processed (i.e. they're validators get executed), and overall a `FormValidationError` gets thrown. This error object internally contains the data from the various `FieldValidationError` objects which got thrown.

The resulting `FormValidationError` error, when rendered to output and sent to the client, looks something like this (assuming JSON output format):

```js
{
  "error": {
    "type": "FormValidationError",
    "msg": "Please correct the errors in the form.",
    "details": {
        "name": ["Must not be empty", "Must be between 1 and 10000000 characters in length"],
    },
  }
}
```

Waigo let's you customize the error messages returned to the client. For example, let's customize the error message returned by the `numberInRange` validator associated with the `age` field above:

```js
"use strict";

module.exports = {
  fields: [
    ...
    {
      name: 'age',
      type: 'number',
      required: true,
      sanitizers: ['trim'],
      validators: [{ id: 'numberInRange', min: 1, max: 105, msg: 'Please enter a realistic age!' }]
    },
  ],
};
```

This `msg` would now show up in the validation error output instead of the default message output by the `numberInRange` validator:

```js
{
  "error": {
    "type": "FormValidationError",
    "msg": "Please correct the errors in the form.",
    "details": {
        "age": ["Please enter a realistic age!"],
    },
  }
}
```