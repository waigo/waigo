# Form state and dirty-checking

Sometimes we may wish to restore a form instance to a previous state, e.g. for serialisation purposes. The form API allows for the *internal state* of a form to be fetched and set:

```js
// save the form state
let form = App.form.create('login');
yield form.setValues( /* new field values */ );
this.session.formState = form.state;
...
// restore the form (and field values) to previous state
let form = App.form.create('login');
form.state = this.session.formState;
```

We can also set the initial internal state during form construction itself:

```javascript
// file: <project folder>/src/controllers/index.js

exports.getLoginForm = function*() {
  let form = this.form.create('login', {
    context: this,
    state: this.session.formState
  });
  ...
};
```

## Dirty-checking

Sometimes you want to pre-populate the fields in a form with values and then quickly determine whether any of the values have changed during submission, i.e. you want to know whether the user made any changes. This is where *dirty-checking* comes in.

All Waigo forms allow you store *original values* for form fields. All submitted data is stored as the *current values* for fields. If there is any difference between these two sets of values then the form is considered "dirty".

Say we have a form which is used to update a user's personal profile. It has two fields - `name` and `age` - representing the user's name and age respectively. This is how we might render the form to the user:

```js
// file: <project folder>/src/controllers/index.js

exports.getProfileForm = function*() {
  let form = this.form.create('profile', {
    context: this
  });
  
  yield form.setOriginalValues({
    name: this.currentUser.name,
    age: this.currentUser.age
  });
  
  yield this.render('profile', {
    form: form
  });
}
```

Assuming we're using the JSON output format, this method will render output similar to:

```js
{
    "form": {
        "id": "profile",
        "fields": {
            "name": {
                "name": "name",
                "type": "text",
                "required": true,
                "originalValue": "John"
            },
            "age": {
                "name": "age",
                "type": "number",
                "required": true,
                "originalValue": 23
            },
            "__csrf": {
                "name": "__csrf",
                "label": "CSRF",
                "type": "hidden",
                "required": true,
                "value": "VyvughpJ-_iBznBk1kxlj4l_TnKqUA8Phg4Y"
            }
        },
        "order": ["name", "age", "__csrf"]
    }
}
```

It is up to the client-side UI to use the `originalValue` data to pre-fill the UI input fields accordingly. Once the form is submitted here is how we would check to see if anything changed from the originals:

```js
// file: <project folder>/src/controllers/index.js
...
exports.submitProfileForm = function*() {
  let form = yield this.form.create('profile', {
    context: this
  });

  yield form.setOriginalValues({
    name: this.currentUser.name,
    age: this.currentUser.age
  });
  
  // process request body
  yield form.process();
  
  // only do further processing if something changed
  if (form.isDirty()) {
    // update user data in db
    // ...
    yield this.render('profile_updated');
  } else {
    // nothing changed
    yield this.render('profile_not_updated');
  }
};
```

Dirty-checking allows us to be more efficient about back-end updates.

