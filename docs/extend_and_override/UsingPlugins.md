# Using plugins

In the previous section you learned how Waigo's module loader works and how it 
enables you to selectively override and extend core Waigo functionality 
within your app. You also saw how Waigo attempts to load a requested file, by 
checking for existence in the following order:

1. `<project folder>/src/<requested path>`
2. `<waigo npm module>/src/<requested path>`

In actual fact the loader also checks *plugins* for the requested path:

1. `<project folder>/src/<requested path>`
2. `<waigo plugin1 folder>/src/<requested path>`
3. `<waigo plugin2 folder>/src/<requested path>`
4. ...
5. `<waigo npm module>/src/<requested path>`

But what is a plugin?

Waigo plugins are re-usable pieces of code which enhance your Waigo app with 
specific functionality. Plugins may selectively extend and override parts 
of the core Waigo framework - hence why the module loader scans plugin paths too, 
as shown above.

By separating non-core re-usable functionality into plugins - which can themselves be thoroughly documented and tested - you will encourage code re-use across projects. 

Plugins help to keep the core Waigo framework more lean and focussed and increase the overall quality of code in the Waigo ecosystem.


### Loading plugins

Waigo automatically tries to work out what plugins are 
available by loading in your app's `package.json` file. By default it searches the 
`dependencies`, `devDependencies` and `peerDependencies` lists for any NPM modules 
which are prefixed with `waigo-plugin-` and assumes that these are Waigo plugins which 
should be loaded.

(Yes, plugins can be packaged and distributed as NPM modules!)

However you can override every aspect of how Waigo determines what plugins get loaded. The [waigo.init()](https://github.com/waigo/waigo/blob/master/src/loader.js) method gives you the available options:

```javascript
/**
 * ...
 * @param {Object} [options.plugins] Plugin loading configuration.
 * @param {Array} [options.plugins.names] Names of plugins to load. If omitted then other options are used to load plugins.
 * @param {Array} [options.plugins.glob] Regexes specifying plugin naming conventions. Default is `waigo-plugin-*`.
 * @param {String|Object} [options.plugins.config] JSON config containing names of plugins to load. If a string is given then it assumed to be the path of a script which exports the configuration. Default is to load `package.json`.
 * @param {Array} [options.plugins.configKey] Names of keys in JSON config whose child keys contain names of plugins. Default is `[dependencies, devDependencies, peerDependencies]`.
 * ...
*/
```

Thus, you can list the desired plugins in a config file of your 
choosing and then supply the path to this file. Or you can directly supply a 
config `Object` itself. Or you can just override the plugin naming conventions. 

### Example

The [waigo-plugin-sitemap](https://www.npmjs.org/package/waigo-plugin-sitemap) plugin adds a cron job which submits a sitemap for your site to Google and Bing once a day. It provides the following file:

* `src/support/cronTasks/submitSitemap.js`

Let's add it to our Hello World! example app and record it in `package.json` so 
that the Waigo loader will pick it up:

```bash
npm install --save waigo-plugin-sitemap 
```

Now restart your app. In the browser you won't see any difference since this plugin 
works in the background and only once a day. But in the console logs you should 
see the Cron task being setup:

```
(RamMacbookPro.local-25179) [2016-07-25 16:07:29.640] [DEBUG] [Cron] - Adding cron task: submitSitemap
(RamMacbookPro.local-25181) [2016-07-25 16:07:29.645] [INFO] [Cron: submitSitemap: 25181] - Setting up cron schedule 0 0 0 * * *
```

Now let's override the Cron schedule and have it run every hour. Override the 
plugin's single file within your app:

```javascript
// file: <project folder>/src/support/cronTasks/submitSitemap.js
"use strict"

const waigo = require('waigo');

const baseCronJob = waigo.load('waigo-plugin-sitemap:support/cronTasks/submitSitemap');

module.exports = {
  schedule: '0 0 * * * *', // every hour
  handler: baseCronJob.handler,
};
```

_Notice how we use the `waigo-plugin-sitemap:` prefix when calling `waigo.load()` 
to ensure that we get the version of the file provided by the plugin._

Restart the app and your console output should now look different:

```
(RamMacbookPro.local-25179) [2016-07-25 16:10:29.640] [DEBUG] [Cron] - Adding cron task: submitSitemap
(RamMacbookPro.local-25181) [2016-07-25 16:10:29.645] [INFO] [Cron: submitSitemap: 25181] - Setting up cron schedule 0 0 * * * *
```

### Plugin conflicts

What would happen if you had two plugins which both provided the same
source file? in this case the call to `waigo.init()` would fail with an error:

```bash
Error: Path "path/to/file" has more than one plugin implementation to choose from: waigo-plugin-name1, waigo-plugin-name2, ...
```

If you need to use both plugins (maybe because they provide other useful
functionality) then pick which plugin's implementation of that file you 
want to use byproviding a version of the file within your app folder. For
example, if you wanted Waigo to use the implementation provided by `waigo-
plugin-name1` then create:

```javascript
// file: <project folder>/src/path/to/file
"use strict";

const waigo = require('waigo');

// use the implementation from waigo-plugin-name1
module.exports = waigo.load('waigo-plugin-name1:path/to/file');    
```

