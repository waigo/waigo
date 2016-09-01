# Post-validation hooks

Once a form has finished processing and validation of all fields have succeeded we usually want to use the submitted values in further processing. 

We could perform this further processing within our controller code, but it would be better if we could somehow "attach" this logic to the form itself and ensure that it is always part of the form's overall processing logic.

This is where post-validation hooks come in. For example, with our user profile form:

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
  postValidation: [
    function* saveProfile(next) {
      let ctx = this.context,
        App = ctx.App,
        user = ctx.currentUser;
      
      user.name = this.fields.name.value;
      user.age = this.fields.age.value;
      
      yield user.save();

      yield next;
    },
    function* emailUser(next) {
      let ctx = this.context,
        App = ctx.App,
        user = ctx.currentUser;

      yield App.mailer.send({
        to: user,
        subject: 'Your profile has been updated',
        bodyTemplate: 'profileUpdated',
      });

      yield next;
    }
  ]
};
```

When `form.process()` gets called Waigo will automatically execute the chain of `postValidation` hooks  - `saveProfile` and `emailUser` - in order, a bit like executing  a chain of middleware.

In the above case our post-validation processing saves the new profile data to the database and then sends an email out to the user informing them of the update. If any of the post-validation hooks fail then the call to `form.process()` itself fails.

Post-validation hooks are implemented as generator methods, as shown above. The `this` context for the called method is the form itself, meaning that within each method you have full access to all the form's fields and other internal data.
