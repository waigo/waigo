# Context-level and App-level data

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
}
```

App-level data - `this.App.templateVars` - is set by the [appTemplateVars](https://github.com/waigo/waigo/blob/master/src/support/startup/appTemplateVars.js) startup step. By default it provides the following utilities:

* `_`: reference to [lodash](http://lodash.com)
* `routeUrl`: for generating [URLs for named routes](../Routing/)
* `staticUrl`: for generating [URLs to static assets](../StaticResources/)
* `config`: your App's [configuration](../AppConfiguration/) object.

Request context-level data - `this.templateVars` - is set by the [contextHelpers](https://github.com/waigo/waigo/blob/master/src/support/middleware/contextHelper.js) middleware and by default includes:

* `currentUser`: the current [session](../Sessions/) user.
* `currentUrl`: same as `this.request.url`.

You can override any of the above template data by passing data for the same keys when rendering your template. For example, if a particular template to have access to a different `currentUrl` you simply need to pass it in when rendering the template:

```js
// file: <project folder>/src/controllers/user.js

exports.showProfile = function*() {
  yield this.render('profile', {
    username: 'john',
    currentUrl: '/profile/john'
  });
}
```
