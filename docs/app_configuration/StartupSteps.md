# Startup steps

Startup steps are responsible for loading the various components of 
your application. They are executed just once, after the 
App's [configuration](Configuration.md) has been loaded and [logging](../logging/) has been setup.

Startup steps are specified in your configuration file:

```javascript
// file: <project folder>/src/config/base.js
...
// startup steps listed in order
config.startupSteps = [
  'db',
  'models',
  'forms',
  'activityRecorder',
  'notifications',
  'acl',
  'middleware',
  'routes',
  'staticResources',
  'actionTokens',
  'mailer',
  'cron',
  'appTemplateVars',
  'listener',
];
...
```

Each of these steps corresponds to a file under the `src/support/startup/` 
path. For example, the [forms](https://github.com/waigo/waigo/blob/master/src/support/startup/forms.js) startup step contains:

```javascript
"use strict";

var waigo = global.waigo,
  _ = waigo._;

/** 
 * Setup forms.
 * @param {App} App  The application.
 */
module.exports = function*(App) {
  App.logger.debug('Setting up forms');

  App.form = waigo.load('support/forms/form');
};
```

By customizing (in the configuration) which startup steps get executed you can fully 
control exactly what your application does at startup. For instance, your application does 
not have to start a HTTP server (`listener`) or have a database 
connection (`db`), or setup Cron jobs (`cron`). If you didn't have any startup steps at all then your app would simply load in its configuration and setup logging, and that would be it.

The startup steps listed above are the ones which are all provided by default with 
Waigo and can of course be [overridden](../extend_and_override/) within your app.

You can also add your own startup steps. For example, lets add a step which simply outputs the current date and time:

```javascript
// file:  <project folder>/src/support/startup/timeAndDate.js

mdoule.exports = function*(App) {
  App.logger.info(new Date().toString());
};
```

Let's not to forget to add it to our configuration. We'll set it to run after 
all the base startup steps are done executing:

```javascript
// file: <project folder>/src/config/development.js

module.exports = function(config) {
  // Remember, config/base.js sets the initial value of config.startupSteps
  config.startupSteps.push('timeAndDate');
};
```
