# Rendering methods

Once output formats are enabled two generator methods are made available on the every request context:

* `render(string templateName, object data = {})` - Render given view template, passing along the given data. 
* `redirect(string url)` - Redirect the client (e.g. browser) to the given URL.

The exact behaviour of the above methods depends on the output format chosen. Regardless, it is recommended that you always use the above methods when you wish to send a response to the client in order to make the most of the output format functionality.

For example, if you are rendering a user's profile page you would have something like the following in your controller:

```js
// file: <project folder>/src/controllers/user.js

exports.showProfile = function*() {
  yield this.render('profile', {
    username: 'john',
    age: 23
  }})
}
```

Waigo will look for a [pug](https://github.com/pugjs/pug) template located at `<project folder>/src/views/profile.pug` and render it to the response body. The `Content-Type` header will be set to `text/html`.

Note that the data passed to the template gets merged with the data set within the [appTemplateVars](https://github.com/waigo/waigo/blob/master/src/support/startup/appTemplateVars.js) startup step and the [contextHelpers](https://github.com/waigo/waigo/blob/master/src/support/middleware/contextHelpers.js) middleware step. By default this means that within your templates you automatically always have access to the app's configuration object, general utility functions and the current URL and session user.

Similar to rendering output, when you wish to redirect the client (browser) to another URL use the `redirect()` method, e.g:

```js
// file: <project folder>/src/controllers/user.js

exports.createProfile = function*() {
  // do some work here to create a user profile
  let profileId = ...;
  
  // now show it
  yield this.redirect(
    this.App.routes.url('show_profile', {
      profile: profileId
    })
  );
}
```

This will set the HTTP status code to 302 and pass the URL to the client.

