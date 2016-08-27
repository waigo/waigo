# Generating URL paths

You can use the `App.staticUrl()` helper method to dynamically generate URLs to static resources from anywhere within your app. This ensures that you don't have to hardcode URL paths, allowing you to easily change where your static resources are stored if necessary.

For example:

```js
// file: <project folder>/src/controllers/index.js

exports.main = function*() {
  yield this.render('index', {
    pathToJs: this.App.staticUrl('/js/app.js');
  });
}
```

You will most likely need to generate static resources URLs within your [view templates](../ViewTemplates/). The above helper method is available as `staticUrl()`:

```pug
// file: <project folder>/src/views/index.pug

script(type="text/javascript" src=staticUrl('/js/app.js'))
```

This will generate the following:

```html
<script type="text/javascript" src="/js/app.js" />
```

You can also see example usage of this helper function in the [default layout template](https://github.com/waigo/waigo/blob/master/src/views/_layout.pug):

```pug
meta(name="msapplication-TileColor", content="#000")
meta(name="msapplication-TileImage", content=staticUrl('waigo:/img/logo.png'))
block css
  link(rel="stylesheet", href=staticUrl('waigo:/css/app.css'))
```

The `waigo:` prefix indicates that the asset is provided by the `waigo` framework itself, thus resulting in a different URL being generated. For example:

```pug
// file: <project folder>/src/views/index.pug

link(rel="stylesheet", href=staticUrl('waigo:/css/app.css'))
```

Would result in:

```html
<link rel="stylesheet" href="/_gen/waigo/css/app.css" />
```

If we had a static asset provided by a plugin we would use that plugin's NPM module name as the prefix. For example, if we wished to include an asset from the `waigo-plugin-bootstrap` plugin:

```pug
// file: <project folder>/src/views/index.pug

link(rel="stylesheet", href=staticUrl('waigo-plugin-bootstrap:/css/app.css'))
```

