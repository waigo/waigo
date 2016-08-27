# Template data

You can pass data through to templates. This can include primitive and object types and even functions. You will typically pass data to templates when rendering them from within your controllers:

```js
// file: <project folder>/src/controllers/user.js

exports.showProfile = function*() {
  // render the "profile.pug" template, and pass in the given object as the template data
  yield this.render('profile', {
    username: 'john',
    age: 23
  }})
}
```

Inside your `profile.pug` template you can access the above data as if it's within the template global scope:

```pug
// file: <project folder>/src/views/profile.pug

p Hello #{username}, you are #{age} years old.
```

Passing a function through is just as easy:

```js
// file: <project folder>/src/controllers/user.js

const moment = require('moment');

exports.showProfile = function*() {
  yield this.render('profile', {
    username: 'john',
    dob: moment('1975-05-26'),
    age: (d, unit) => moment(d).diff(moment(), unit)
  });
}
```

Then in your template:

```pug
// file: <project folder>/src/views/profile.pug

p Hello #{username}, you are #{ age(dob, 'years') } years old.
```

