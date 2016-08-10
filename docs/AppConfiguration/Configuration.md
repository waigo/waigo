# Configuration

When starting up your app the first thing it does is load in the configuration 
from `src/config/base.js`. 

The configuration file exports a single function which takes an empty `config` object 
as parameter. It then adds properties to this object. This object is from 
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

The `base.js` configuration file gets auto-generated if you using the CLI to 
setup your app - it will copy the [default verson](https://github.com/waigo/waigo/blob/master/src/cli/config/base.js) provided by the framework into your app. This default configuration is geared towards running your Waigo application in dev mode. If you do not have a `base.js` configuration file present in your app then Waigo will fallback to using its own one.

## Working with Modes

When developing your application locally you may wish to configure it differently to 
when it's deployed in production. For example, you may wish to point your 
application to a local development-mode database rather than your production one.

By default your Waigo app runs in `development` mode. The mode can be 
explicitly set using the `NODE_ENV` environment variable. Thus in production 
deployments you might run your app like so:

```bash
NODE_ENV=production ./start-app.js
```

The configuration loader will first load the base configuration and then try to 
load a file based on the mode:

1. `src/config/base.js` - _base configuration file_
2. `src/config/<NODE_ENV>.js` - _mode-specific configuration file_

If any of these files isn't provided by your app then the [module loader](../ExtendAndOverride/ModuleLoader.md) will load the 
corresponding version provided within Waigo. Note that Waigo currently [only provides `base.js`](https://github.com/waigo/waigo/tree/master/src/config) by default.

Each file is expected to export a single function to which a configuration `Object` 
gets passed:

```javascript
module.exports = function(config) {
  config.someSetting = ...
  ...
};

```

**The mode-specific configuration file overrides settings from the 
base configuration file.** Thus you should place settings common to all modes in 
the base configuration file and then override only what needs to be different in your mode-specific configuration files.


## User-specific configuration

Sometimes you may wish to further customize configuration depending on who is running the app. 

For instance, let's say you have multiple developers working on an application and that one of the configuration settings required by the app in `development` mode is the developer's home folder on their machine.

You may create `src/config/development.js` and have it contain:

```javascript
module.exports = function(config) {
  config.userHomeFolder = 'enter home folder path here';
};
```

If you commit this file to the repository then other people can use it. But they would have to first edit the file, set the right folder path, and then run the app, all the while being careful not to commit the change.

A better approach is to use user-specific configuration files. For example, if Bob (whose local user id is `bob`) wishes to run the app he would create `src/config/development.bob.js`:

```javascript
module.exports = function(config) {
  config.userHomeFolder = '/home/bob';
};
```

And Ryan would create `src/config/development.ryan.js`, and so on. 

The configuration loader will try to load configuration files in the following order:

1. `src/config/base.js` - _base configuration file_
2. `src/config/<NODE_ENV>.js` - _mode-specific configuration file_
3. `src/config/<NODE_ENV>.<user>.js` - _mode- and user-specific configuration file_

The `user` is the user id of the owner of the Waigo app process. It is always accessible within controllers and back-end code as `App.user`.



