# Shutdown steps

Similar to startup steps, Waigo also has _shutdown steps_ - tasks which 
get executed when `App.shutdown()` is called. 

They are specified in your configuration file:

```javascript
// file: <project folder>/src/config/base.js
...
// startup steps listed in order
config.shutdownSteps = [
  'listener',
  'cron',
  'acl',
  'db',
];
...
```

Each of these steps corresponds to a file under the `src/support/shutdown/` 
path.

Shutdown steps give your app a chance to close any opened resource connections and 
do any cleanup necessary before fully shutting down. They are especially useful 
to have if you're doing automated tests with a Waigo app and need start and stop 
an app multiple times.

