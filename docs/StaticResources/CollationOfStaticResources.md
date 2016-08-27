# Collation of static resources

The [staticResources startup step](https://github.com/waigo/waigo/blob/master/src/support/startup/staticResources.js) ensures that all available static resources (from your app, the Waigo framework and any plugins) is made available within your designated static resources folder, ready to be served up at runtime.

The path to your static resources folder is specified in your app's configuration:

```js
// file: <project folder>/src/config/base.js

/**
 * Static resources folder (relative to <project folder>/src)
 */
config.staticResources = {
  folder: '../public'
};
```

If you are using the [default gulp scripts](../GettingStarted/BuildWorkflowLiveReload.md) you will notice that all front-end assets get automatically built and placed into `<project folder>/public` everytime a change is made to their source files.

During startup, Waigo will look for the existence of a `public` folder inside the Waigo framework and any enabled Waigo plugins and copy the contents of these into the `_gen` subfolder within your app's static resources folder. Once your app has started up the relevant folder tree will look something like the following:

```shell
<waigo framework>
  /public
    /js    # built JS assets
    /css   # built CSS assets
    /img   # built image assets
    ...
    /_gen    # static assets from Waigo framework and plugins
      /waigo	# static assets from Waigo
      /waigo-plugin-test  # static assets from waigo-plugin-test
      ...
```

The contents of `/public/_gen/waigo` are the same as the contents of `<waigo framework>/public`. And likewise for each plugin whose static assets are copied over into the app's static resources folder.

You can place any assets you want into the static resources folder. But Waigo's built-in assets and that of any enabled plugins will always be placed under the `_gen` subfolder (shown above) for consistency sake.

*Note: If you are building a Waigo plugin then it is highly recommended that you stick to using the default folder path for static resources so that apps using your plugins will be able to find and load its static assets without problem.*

