# Overview

The configuration for your Waigo application is `src/config/base.js`. 

The configuration gets loaded during the startup phase of your application. The configuration file exports a single function which takes an empty `config` object 
as parameter. It then adds properties to this object. This object and is from 
then onwards always accessible as `App.config` within your 
controllers and other backend code. In templates it is accessible via the 
`config` template variable. 


```javascript
// <project folder>/src/config/base.js

module.exports = function(config) {
  config.port = (process.env.PORT || 3000);
  config.baseURL = 'http://localhost:' + config.port;
  ...
};
```

This file gets auto-generated if you using the CLI to setup your app - it will copy the [default verson](https://github.com/waigo/waigo/blob/master/src/cli/config/base.js) provided by the framework into your app. This default configuration is geared towards running your Waigo application in dev mode. If you do not have a `base.js` configuration file 
present in your app then Waigo will fallback to using its own default one.

