# Static asset paths

When linking to static assets from within your templates you can use the `staticUrl()` helper function to dynamically generate paths. This ensures that if you change where static assets are stored in future you don't have to then update your templates.

For example:

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

_Note: The [Static resources](../StaticResources/) docs go into more detail about why it generates such a URL._

If we had static asset provided by a plugin we would use that plugin's NPM module name as the prefix. For example:

```pug
// file: <project folder>/src/views/index.pug

link(rel="stylesheet", href=staticUrl('waigo-bootstrap:/css/app.css'))
```

