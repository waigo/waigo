# How it works

Waigo's most powerful feature is its module loading architecture. Before we explain exactly what it is and how it works let's see it in action! 

Continuing on from our Hello World! example, go into your project folder and 
create `src/controllers/index.js`:

```javascript
// file: controllers/index.js

exports.main = function*() {
  this.body = 'Hello world!';
};
```

Now restart the app (`./start-app.js` or it will be automatic if you're using 
`gulp dev`) and refresh the page in the browser. You should see _Hello world!_ printed on screen.

What you just did was override the default `index` controller built into Waigo 
with your own.

## Module loader

Waigo has its own module loader, which is used instead of `require()` when
it wishes to load a CommonJS module file from within its `src` folder.

Taking the simple example above, when Waigo wishes to find the controller to 
handle the route it calls `waigo.load("controllers/index")` rather than using 
`require()`. At this point the actual controller code which gets loaded and 
returned will depend on the first available one in the given locations:

- `<project folder>/src/controllers/index.js`
- `<waigo npm module>/src/controllers/index.js`

Thus, if `src/controllers/index.js` isn't present within your project folder then 
Waigo will load and return the one proided by the Waigo framework itself. If 
even the framework has no file matching the path then an error is thrown.

If you look inside Waigo's source code you will notice that this module loading 
convention - `waigo.load()` - is used everywhere. This is what enables you to 
cleanly and selectively override core framework code with your own custom 
version which sits inside your app's project folder.

_Note: Normal NPM modules - e.g. `lodash` - are still loaded using `require()`. 
`waigo.load()` is only applicable to files within the `src` folder._

### Extend vs. Override

You can also extend a file from Waigo without totally overriding it:

```javascript
// file: controllers/index.js
"use strict";

const waigo = require('waigo');

// load the waigo version 
const waigoIndexController = waigo.load('waigo:controllers/index');

exports.main = function*() {
  console.log('delegating to core');

  yield waigoIndexController.main.call(this);
}
```

In this example, although we've overridden the `index` controller within the app, 
internally it just calls the same-named method provided by Waigo's index controller. 

By simply prefixing the module path with `waigo:` the module loader will load the version 
of the file provided by Waigo, ignoring any provided by your app.

### Ommitted files

Waigo's module loader does not index every single file within `src/`, just the ones 
where it makes sense to allow for overriding.

Files under the `cli/data` and `frontend` do not get indexed by Waigo's 
module loader. 

Template files (e.g. `.pug`) contained within the `view` and `emails` folders do get indexed, except where the filenames are prefixed with an underscore (`_`), as 
these are considered to be *include* files.

--

Overall, the loader mechanism allows you to:

1. Only load the parts of the framework you will actually use _(good for 
performance)_.
2. Override any framework module file with your own version _(extendability 
and customisation)_.

In the next section you will learn how this module loading architecture enables you 
to easily bundle up your customizations for re-use as plugins.
