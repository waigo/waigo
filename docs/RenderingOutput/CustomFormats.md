# Custom output formats

You can easily add your own custom output formats. Let's say you
wanted to add an XML output format. You first need to create an implementation for it:

```javascript
// file: <project folder>/src/support/outputFormats/xml.js

import XmlRenderer from ...

exports.create = function(logger, config) {
  var render = XmlRenderer.init(config);    

  return {
    render: function*(view, locals) {
      this.body = yield render(view, _.extend({}, locals, this.app.locals));
      this.type = 'application/xml';
    },
    redirect: function*(url) {
      this.response.redirect(url);      
    }
  };
};
```

Now you just need to enable it in the `outputFormats` middleware config:

```js
{
  formats: {
    xml: {
      // ... config options.
    }
    html: {
      // ... config options.
    },
    json: {
      // ... config options.
    }
  },
  paramName: 'format',
  default: 'html'
}
```
