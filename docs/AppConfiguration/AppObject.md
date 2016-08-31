# App object

Your application's central point of control is the [Application object](https://github.com/waigo/waigo/blob/master/src/application.js), accessible as `App` inside your 
controllers and other back-end code:

```javascript
// <project folder>/src/controllers/...

exports.index = function*() {
  // this.App
};
```

This object holds your app's configuration and acts as the gateway to the 
various components which make up your app. It also holds a reference to the 
underlying `koa` application object in case you need to access it.

The Application object is also responsible for starting up and subsequently 
shutting down your application.