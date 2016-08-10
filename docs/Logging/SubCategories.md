# Sub-categories

Although the [application-level logger](HowToUse.md) suffices in most cases for 
when you wish to log something, it is often better to log to specific categories 
and sub-categories. Logging to specific categories makes it easier to see where specific 
log messages originate from:

```bash
(RamMacbookPro.lan-54179) [2016-07-29 12:30:58.860] [DEBUG] [StaticResources] - Copy /var/folders/4v/br6x6mlx113235v1lz39nwfc0000gn/T/waigo-app -> /Users/ram/dev/js/waigo-framework/waigo/public/_gen
(RamMacbookPro.lan-54179) [2016-07-29 12:30:58.879] [DEBUG] [ActionTokens] - encryption key (RamMacbookPro.lan-54179) [2016-07-29 12:30:59.603] [DEBUG] [app] - Running startup step: cron
(RamMacbookPro.lan-54179) [2016-07-29 12:30:59.605] [INFO] [Cron] - 1 cron tasks found
(RamMacbookPro.lan-54179) [2016-07-29 12:30:59.605] [DEBUG] [Cron] - Adding cron task: notifyAdminsAboutUserStats
(RamMacbookPro.lan-54179) [2016-07-29 12:30:59.622] [INFO] [Models/Cron/notifyAdminsAboutUserStats] - Setting up cron schedule 0 0 3 * * 1
``` 

In the above example, `Models/Cron/notifyAdminsAboutUserStats` is a sub-category 
of `Models/Cron` which is a sub-category of `Models` which itself is a sub-category 
of the root empty category. Notice the `app` category - this is the application-level 
logger's category.

To create a sub-category logger, simply call `App.logger.create()` with a 
category name. The logger instance returned by `create()` will have the same `create()` 
method attached to it, allowing you to create sub-categories within sub-categories and 
so on:

```javascript
// file: src/controllers/index.js

exports.main = function*() {
  var modelLogger = this.App.logger.create('Model');  // Model
  var cronModelLogger = modelLogger.create('Cron');   // Model/Cron
  var jobLogger = cronModelLogger.create('MyJob');    // Model/Cron/MyJob

  // use it like any other logger
  jobLogger.info('informational message');
}
```

_Note: sub-category loggers respect the minimum logging level set for their root 
ancestor logger, which has its minimum level initially set according to what's in 
the logger configuration._
