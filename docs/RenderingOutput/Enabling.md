# Enabling output formats

Output formats are enabled using the `outputFormats` middleware .The default [configuration](../AppConfiguration/) has something like this:

```js
{
  // List of enabled formats along with options to pass to each formatter. */
  formats: {
    html: {
      // Default view template filename extension when not explicitly provided. */
      ext: 'pug',
      // Whether compiled templates should be cached in memory (not all template engines honour this)
      cache: false,
      // Map file extension to rendering engine
      engine: {
        'pug': 'pug',
      }
    },
    json: {}
  },
  // Use this URL query parameter to determine output format. */
  paramName: 'format',
  // Default format, in case URL query parameter which determines output format isn't provided. */
  default: 'html'
}
```

The above configuration specifies two output formats: `html` and `json`. The default format is `html`, though this can be overridden using the `format` URL parameter. If `html` is the chosen output format then a different rendering engine is chosen based on the extension of the view template. In the above case we are specifying that all `.pug` templates are to be rendered by the [pug](https://github.com/pugjs/pug) templating engine. Where the view template is specified without an extension, `.pug` is assumed. 

The default output format is set to `html`. The query parameter used to dynamically set the output format at runtime is called `format`. Example usage: `http://mydomain.com/user/register?format=json`.

