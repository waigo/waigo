# JSON output

To output JSON from your routes - and thus have your routes behave like an API - the context-based rendering methods are used in exactly the same way as your would when rendering HTML.

Taking the [previous example](RenderingMethods):

```js
// file: <project folder>/src/controllers/user.js

exports.showProfile = function*() {
  yield this.render('profile', {
    username: 'john',
    age: 23
  }})
}
```

When using the JSON output this will get returned as the following, with the `Content-Type` header being set to `application/json`:

```js
{
  username: 'john',
  age: 23
}
```

The [JSON output format handler](https://github.com/waigo/waigo/blob/master/src/support/outputFormats/json.js) does not currently make any use of the passed in template name (`"profile"` in the above example). But it is recommended that you still provide a template name just in case you decide to switch to a different output format in future which does use templates.

The JSON output format can be used with any and all HTTP methods used with your routes - GET, POST, PUT, etc.

