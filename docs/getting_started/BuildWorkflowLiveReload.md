# Build workflow and Live reload

When developing an app it's annoying if you have to constantly restart the server to see your latest changes. Generally speaking, developers will use a tool to monitor source code for changes and automatically restart the server and rebuild front-end assets when necessary.

Waigo comes with a set of built-in [gulp](http://gulpjs.com/) scripts which do just that for you. And you can add them to your Waigo app using the CLI tool.

Continuing on from the previous [Hello World example](RunningHelloWorld.md) go into your project folder and type:

```shell
$ waigo init-gulp
```

This will install gulp and a few gulp plugins, create a `gulpfile.coffee` and an associated set of tasks within a `gulp/` subfolder:

```
gulpfile.coffee  # main gulp file 
/gulp            # contains gulp tasks
  /dev-frontend.coffee  # dev frontend
  /dev-server.coffee    # dev server
  /dev.coffee           # dev
  /frontend-css.coffee  # build frontend Stylus
  /frontend-js.coffee   # build frontend JS
  /frontend-img.coffee  # build frontend Images
  /frontend.coffee      # build frontend
  /utils/               # utility methods
```

To start up a dev server which will auto-restart Waigo whenever your app code changes (as well as rebuild front-end assets when they are updated):

```shell
$ gulp dev
```

## Front-end conventions

In order for the default gulp tasks to work properly your front-end code will need to adhere to a specific folder structure:

```
/src
  /frontend        # frontend assets
    /stylus        # stylus assets
    /js            # javascript assets
    /img           # image assets
```

[Browserify](http://browserify.org/) is used to package up your Javascript. The gulp task will look for a single `app.js` file within `src/frontend/js`  and build it along with all its dependencies into `public/js/app.js`.

[Stylus](http://stylus-lang.com/) is the default pre-processor of choice in Waigo. The gulp task will look for a single `app.styl` file within `src/frontend/stylus` and build it along with all its dependencies into `public/css/app.css`.

The image assets under `src/frontend/img` get copied into `public/img` without any further modification.

These are just the defaults in Waigo. You are of course free to modify the gulp scripts to work with your folder structure, your preprocessor language of choice, and do just about anything else you would normally do in gulp.


## Live reload

All built front-end assets get placed within subfolders of `public/`. Whenever something within this folder is changed the dev server started up by running `gulp dev` will inform the browser, which will then auto-reload the changed assets or reload the web-page as a whole depending on what changes.

Running `gulp dev` will ensure front-end assets get auto-rebuilt into `public/` whenever they are changed, thus ensuring that the browser-side live reload mechanism kicks in 
whenever you modify your frontend asset source files.

_Note: Adding a new file will not trigger a live-reload. This is due to a 
limitation in underlying library used to watch for changes. In such instances you 
may need to restart `gulp dev`_.

## Minification

By default front-end assets are not minified when built. To enable minification simply use the `minified` flag on the command-line:

```shell
$ gulp dev --minified
```

## Production builds

For production deployments you will want to build the front-end assets without running a dev server. To do this run the `frontend` task:

```shell
$ gulp frontend --minified
```






