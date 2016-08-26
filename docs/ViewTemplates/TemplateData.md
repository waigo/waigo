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

## Context-level and app-level data

Waigo passes along context-level and app-level template data to your template, alongside the data you specify when rendering a template. 

The default [HTML output format handler](https://github.com/waigo/waigo/blob/master/src/support/outputFormats/html.js) first loads in app-level template data. It then overwrites with request context-level template data. And finally with the template data passed into the `render()` call:

```js
    render: function*(view, templateVars) {
      ...
      templateVars = _.extend({}, this.App.templateVars, this.templateVars, templateVars, {
        cache: !!config.cache,
        engine: config.engine[ext],
      });
      ...
```

App-level data - `this.App.templateVars` - set by the [appTemplateVars](https://github.com/waigo/waigo/blob/master/src/support/startup/appTemplateVars.js) startup step. By default it provides the following utilities:

* `_`: reference to [lodash](http://lodash.com)
* `routeUrl`: same as `App.routes.url`, for generating URLs for named routes
* `staticUrl`: same as `App.staticUrl`, for generating URLs to static assets
* `config`: your App's [configuration](../AppConfiguration/) object.

Request context-level data is set by the [contextHelpers](https://github.com/waigo/waigo/blob/master/src/support/middleware/contextHelper.js) middleware and by default includes:

* `currentUser`: the current [session](../Sessions/) user.
* `currentUrl`: same as `this.request.url`.

You can override any of the above template data by passing data for the same keys when rendering your template. For example, if a particular template to have access to a different `currentUrl` I simply need to pass it in when rendering:

```js
// file: <project folder>/src/controllers/user.js

exports.showProfile = function*() {
  yield this.render('profile', {
    username: 'john',
    currentUrl: '/profile/john'
  });
}
```
