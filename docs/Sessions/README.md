# Sessions

Built-in session handling comes courtesy of the [koa-session-store](https://github.com/hiddentao/koa-session-store) library. This provides for pluggable session storage including cookies and [mongodb](https://github.com/hiddentao/koa-session-mongo). You can also easily write your own custom storage adapters in case you want session data to be stored differently.

On the browser side the session key is stored within a signed cookie. Thus, if you are using sessions ensure you inform the user at some point that cookies will be used.

## Accessing session data

You can access session data using the request context `session` key within your controllers:

```javascript
// file: <project folder>/src/controllers/someController.js

exports.index = function*(next) {
  yield this.render('index', {
    name: this.session.userName
  });
};
```

Any data which can be stringified into JSON can be stored in the `session` object.

To completely delete a session simply use `this.session = null`.


## Enabling sessions

Sessions are created and loaded by the `sessions` middleware. The default configuration looks as follows:

```javascript
// file: <waigo framework>/src/config/base.js

const waigo = global.waigo,
  _ = waigo._;


config.middleware.ALL = {
  _order: [
    'sessions',
  ],
  sessions: {
    // cookie signing keys
    keys: [
      'key1',  // REPLACE WITH MORE SECURE HEX KEY
      'key2',  // REPLACE WITH MORE SECURE HEX KEY
      'key3',  // REPLACE WITH MORE SECURE HEX KEY
    ],
    // session cookie name
    name: 'waigo',
    // session storage
    store: {
      // session store type (name of module file in `support/session/store`)
      type: 'cookie',
      // session store config
      config: {
        // nothing needed for cookie storage
      }
    },
    // session cookie options
    cookie: {
      // cookie expires in...
      validForDays: 7,
      // cookie valid for url path...
      path: '/'
    }
  },
}
```

The above configuration enables sessions using the `cookie` storage adapter. This means all session data is stored within the browser cookie, encrypted using array of key specified (see `keys`). Each session is valid for a maximum of 7 days.


