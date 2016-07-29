# How to use

Waigo initializes an app-level logger - `App.logger` - during the app 
startup phase. By default this logger is an instance of [log4js](https://github.com/nomiddlename/log4js-node) and supports logging levels, categories and multiple types of 
logging transports (i.e not just console logging).

Default [logging configuration](https://github.com/waigo/waigo/blob/master/src/config/base.js) just specifies a console logger:

```javascript
// file: <waigo>/src/config/base.js

config.logging = {
  category: 'app',
  minLevel: 'DEBUG',
  appenders: [
    {
      type: 'console',
      ...
    }
  ],
};
```

Override the `config.logging` in your own configuration files to customize how the
logger works. The actual code which creates the logger is located in 
[src/support/logger.js](https://github.com/waigo/waigo/blob/master/src/support/logger.js), and this too can be overridden or extended if you want further control over how the 
default logger is constructed and configured.

Inside your back-end code you can use the logger as follows:

```javascript
// file: <project folder>/src/controllers/index.js

exports.main = function*() {
  // log at INFO level
  this.App.logger.info('informative message', someObject);
  // log at TRACE level
  this.App.logger.trace('trace data', lowLevelData);
}
```

_Note: It is highly recommended that use `App.logger` instead of the `console` log methods, 
as this will give you more control over the output of messages as well as the ability 
to hide less-important messages by simply tweaking the configuration._

## Levels

The available `App.logger` methods (in increasing order of priority) are: `trace`, 
`debug`, `info`, `warn`, `error`. These correspond to different logging _levels_:

* `ERROR` - for errors in your application which prevent a task from being 
completed. All uncaught exceptions in your app are automatically logged at this level via the app logger.
* `WARN` - for errors which don't prevent a task from being completed.
* `INFO` - for informational messages which you always want to see.
* `DEBUG` - for low-level informational messages which you may only wish to see if 
you are, for example, attempting to debug an issue.
* `TRACE` - for really low-level informational messags which you wish to see in 
only the rarest circumstances, e.g. if messages at the `DEBUG` level aren't 
enough to figure out what's wrong.

