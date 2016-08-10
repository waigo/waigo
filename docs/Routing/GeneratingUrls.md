# Generating URLs

Often times you will want to reverse-lookup a route, i.e. generate the URL for a given route. For example, if you wish to email the user a link to their account settings page you would want to generate a URL for the account settings route that's unique to that user.

You can use the `App.routes.url()` method to facilitate this.

Let's say we have an per-user account settings route configured as such:

```javascript
// file: <project folder>/src/routes/user.js

module.exports = {
  '/user/:id': {
    name: 'user_settings_route',
    GET: 'users.settings',
  }
};
```

Notice the `name` value above. This is how we will refer to the route when we wish to do a reverse lookup. This value can be anything you want, though we suggest something indicative of what the route does.

Thus, for user `foobar` the URL would be `/user/foobar`. To generate this URL using the routing system simply do:

```javascript
// file: <project folder>/src/controllers/index.js

exports.main = function*() {
  let url = this.App.routes.url('user_settings_route', {
    id: 12
  });
  
  /* /user/12 */
}
```

Notice that the route URL has an `id` parameter. Thus we have to pass in a value for this parameter (as shown above) in order for a URL to be successfully generated.

Within view templates the same method is exposed as `routeUrl`. Here is a template example:

```pug
div
  a(href=routeUrl('user_settings_route', {id:12})) Settings page
```