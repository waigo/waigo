# Forms

Forms are treated as first-class citizens in Waigo. Each form is defined in a file and can be loaded, completed and processed programmatically from any part of your app. Waigo lets you design and use your own form input types and add custom sanitation and validation logic to your liking.

* [Defining and using](DefiningAndUsing.md)
* [State and dirty-checking](StateAndDirtyChecking.md)
* [Sanitizers](Sanitizers.md)
* [Validators](Validators.md)
* [Post-validation hooks](PostValidationHooks.md)
* [Built-in field types](BuiltInFieldTypes.md)
* [Custom field types](CustomFieldTypes.md)


## Internal state

Sometimes we may wish to restore a form to a previous state. The form 
architecture allows for this exposing the ability to get and set the form's 
internal state. This state contains the current field values too.

```javascript
// save the form state
var form = Form.new('signup');
yield form.setValues( /* user input values */ );
this.session.formState = form.state;
...
// restore the form (and field values) to previous state
var form = Form.new('signup');
form.state = this.session.formState;
```

We can also set the internal state during construction:

```javascript
var form = Form.new('signup', this.session.formState);
```

## Sanitization

When setting form field values Waigo first sanitizes them. Sanitization is
specified on a per-field basis in the form configuration. Let's trim all user
input to our signup form:

```javascript
// file: forms/signup.js

module.exports = {
  fields: [
    {
      name: 'email',
      type: 'text',
      label: 'Email address',
      sanitizers: [ 'trim' ]
    },
    {
      name: 'password',
      type: 'password',
      label: 'Password',
      sanitizers: [ 'trim' ]
    },
    {
      name: 'confirm_password',
      type: 'password',
      label: 'Confirm password',
      sanitizers: [ 'trim' ]
    }
  ]  
};
```

Each item in the `sanitizers` array refers to the name of a module file under
the `support/forms/sanitizers/` path. So for the above form specification Waigo
will expect the following path to exist:

* `support/forms/sanitizers/trim`

A sanitizer module should export a single function which returns a generator
function (this performs the actual sanitization). For example, Waigo's built-in
`trim` sanitizer looks like this:

```javascript
var validatorSanitizer = require('validator');

module.exports = function() {
  return function*(form, field, value) {
    return validatorSanitizer.trim(value);
  }
};

```

If sanitization fails then a `FieldSanitizationError` error gets thrown
for the field for which it failed.

The actual sanitization function gets passed a `Form` and `Field` reference
corresponding to the actual form and field it is operating on. This makes it
possible to build complex sanitizers which can query other fields and the form
itself. 

Note that you can set field values without sanitization processing:

```javascript
// without sanitization
form.fields.email.value = 'me@univers.com';

// with sanitization (this will set .value after sanitization is complete)
yield form.fields.email.setSanitizedValue('ram@hiddentao.com');
```

Setting values for multiple fields:

```javascript
// this calls Field.prototype.setSanitizedValue
yield form.setValues({
  email: 'ram@hiddentao.com',
  password: 'test'
});
```

## Validation

Once form field values have been set we can validate them by calling
`Form.prototype.validate()`. Validation is specified on a per-field basis in the
form configuration. Let's validate our signup form:

```javascript
// file: forms/signup.js

module.exports = {
  fields: [
    {
      name: 'email',
      type: 'text',
      label: 'Email address',
      sanitizers: [ 'trim' ],
      validators: [ 'notEmpty', 'isEmailAddress' ]
    },
    {
      name: 'password',
      type: 'password',
      label: 'Password',
      sanitizers: [ 'trim' ],
      validators: [ 'notEmpty', { id: 'isLength', min: 8 } ]
    },
    {
      name: 'confirm_password',
      type: 'password',
      label: 'Confirm password',
      sanitizers: [ 'trim' ],
      validators: [ { id: 'matchesField', field: 'password' } ]
    }
  ]  
};
```

Each item in the `validators` array refers to the name of a module file under
the `support/forms/validators/` path. When a validator (or even sanitizer) is
specified as an object then its `id` attribute is assumed to be its module file
name. The object itself is assumed to be a set of options to pass to the
module file during initialisation.

So for the above form specification Waigo will expect the following paths to exist:

* `support/forms/validators/notEmpty`
* `support/forms/validators/isLength`
* `support/forms/validators/matchesField`

A validator module exports a single function which should return a generator
function (this performs the actual validation). For example, Waigo's built-in
`isEmailAddress` validator looks like this:

```javascript
var validator = require('validator');

module.exports = function() {
  return function*(form, field, value) {
    if (!validator.isEmail(value)) {
      throw new Error('Must be an email address');
    }
  }
};

```

The actual validation function gets passed a `Form` and `Field` reference
corresponding to the actual form and field it is operating on. This makes it
possible to build complex validators which can query other fields and the form
itself.

## Validation errors

Validaton error reporting is very comprehensive and makes it easy to show the
end-user exactly what failed to validate and why.

This is what happens when `Form.prototype.validate()` gets called:

1. `Field.prototype.validate()` gets called for each field belonging to the form.
2. For each field every validator gets run and all validation errors are 
grouped together within a single `FieldValidationError` instance. 
3. In `Form.prototype.validate()` all field validation errors are grouped 
together within a single `FormValidationError` instance. 

When sending this error object back to the client it's view object 
representation gets generated and looks something like:

```javascript
{
  type: 'FormValidationError',
  msg: 'Form validation failed',
  errors: {
    field1: {
      type: 'FieldValidationError',
      msg: 'Field validation failed',
      errors: {
        notEmpty: {
          type: 'Error',
          msg: 'Must not be empty'
        },
        isEmailAddress: {
          type: 'RuntimeError',
          msg: 'Must be email address'
        },
        ...
      }
    },
    ...
  }
}
```

Sometimes you might not need such detail and may simply wish to display the 
specific error messages associated with each field. In such cases set the 
following inside your controller, prior to rendering output:

```javascript
this.request.leanErrors = true;
```

The final view object will look like:

```javascript
{
  type: 'FormValidationError',
  msg: 'Form validation failed',
  fields: {
    field1: [
      'Must not be empty',
      'Must be email address',
      ...
    ],
    ...
  }
}
```

## Dirty checking

Form fields have two types of values - _original values_ and _current values_. 
Sanitization and validation takes place on a form's current values, and these 
are the values input by the user. 

Original values on the other hand are meant to represent the original 
values of the form's various input fields when the form gets displayed to 
the user. You are not forced to set or use original values, but they're 
useful if you wish to check whether the user made any changes to the form.

Every `Field` instance exposes an `isDirty()` method to check whether the
current value differs from the original value. Every `Form` instance also
exposes this method, which simply calls through to the same for every one of
its  fields. If even one field is dirty then the form is considered dirty.

Let's see how this works in pracice...

Say the user signed up to our site with a name and telephone number. They wish 
to edit these details. The form for this:

```javascript
// file: <app folder>/forms/editProfile.js

{
  id: 'editProfile',
  fields: [
    {
      name: 'name',
      type: 'text',
      sanitizers: [ 'trim' ],
      validators: [ 'notEmpty' ]
    },
    {
      name: 'phone',
      type: 'text',
      sanitizers: [ 'trim' ],
      validators: [ 'notEmpty', 'isPhoneNumber' ]
    }
  ]  
}
```

When the user submits the form we wish to find out whether they have made any 
changes. In the route handler which processes the user submission we might have:

```javascript
// file: <app folder>/controllers/profile.js

exports.updateProfile = function*(next) {
  var model = {
    name: //...existing name...
    phone: //...exiting phone number...
  };  

  try {
    var form = Form.new('editProfile');
    yield form.setOriginalValues(model);
    yield form.setValues(this.request.body);
    yield form.validate();

    if (form.isDirty()) {
      //...update model data and persist...
    }

    this.response.redirect('/profile');
  } catch (err) {
    //...handle sanitization, validation errors, etc...
  }
};
```

In the above controller method we only update the model data and persist it if 
if has actually changed. Thus 'dirty checking' allows us to be efficient with 
updates.

