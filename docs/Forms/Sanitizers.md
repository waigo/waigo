# Field sanitizers

Waigo allows for form field values to be *sanitized*. Sanitizing a field may involving trimming it (if it's a string), converting it to a primitive different type, etc. In essence it's about ensuring the field's value is of the appropriate type before any further processing takes place.

Taking another look at our example user profile editing form, let's now add sanitizers to the fields:

```js
"use strict";

module.exports = {
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      sanitizers: ['trim']
    },
    {
      name: 'age',
      type: 'number',
      required: true,
      sanitizers: ['trim']
    },
  ],
};
```

Each sanitizer represents a file under the `support/forms/sanitizers` path. The [`trim` sanitizer](https://github.com/waigo/waigo/blob/master/src/support/forms/sanitizers/trim.js) trims all incoming string values:

```js
// file: <waigo>/src/support/forms/sanitizers/trim.js
"use strict";

const waigo = global.waigo,
  _ = waigo._;

module.exports = function() {
  return function*(field, value) {
    return (typeof value === 'string' ? _.trim(value) : value);
  }
};
```

*Note: Sanitizers are implemented as generator functions, meaning you can do asynchronous processing within them!*

Submitted form data usually comes in as strings, which is why this sanitizer makes sense for even the `age` field. 

Notice that `sanitizers` is specified as an array. This is because fields can have multiple sanitizers attached to them, each of which gets executed in order. For example, if the sanitizer list is `['trim','truncate']` then Waigo would first pass the input value to the `trim` sanitizer, and then the output of that would get passed to the `truncate` sanitizer and so on. The final post-sanitation value would be saved as the field's value.

In our form spec above, the `age` field is a number, meaning we need for its value to be a number rather than a string before we make further use of it. Thankfully we don't need to provide a sanitizer to do this since the [`number`](https://github.com/waigo/waigo/blob/master/src/support/forms/fields/number) field type attaches a default sanitizer which does exactly this. :

```js
// file: <waigo>/src/support/forms/fields/number.js

"use strict";

const waigo = global.waigo,
  _ = waigo._,
  TextField = waigo.load('support/forms/fields/text');


class NumberField extends TextField {
  constructor(form, config) {
    super(form, config);

    this._addSanitizer(
      function*(field, value) {
        return Number(value);
      }
    )
  }
}

module.exports = NumberField;
```

*Note: This internal sanitizer gets executed AFTER the sanitizers specified for the field in the form configuration.*

When we call `form.process()` on a form instance it internally runs each field's submitted value through the corresponding list of sanitizers prior to any further processing. If an error gets thrown from a sanitizer then a `FieldSanitizationError` gets thrown for that particular field.

## Built-in sanitizers

Here are the [built-in sanitizers](https://github.com/waigo/waigo/blob/master/src/support/forms/sanitizers) which come with Waigo:

* `trim` - trim the input string of leading and trailing spaces, as used in the above examples. Users sometimes accidentally add trailing spaces to usernames and passwords when typing. This sanitizer helps to deal with such cases.
* `lib` - apply one of the of the sanitizing methods from the [validator NPM module](https://github.com/chriso/validator.js). For example, if you wanted to use the `ltrim()` method from this library this is how you would declare it in the sanitizer list:
  * `{ id: 'lib', method: 'ltrim', args: 'abc' }` - trim all occurrences of `a`, `b` or `c` from the left side of the input string.
