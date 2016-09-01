# Custom field types

Sometimes the built-in field types are not enough for your needs. If you find yourself applying lots of sanitizers and validators in the same pattern repeatedly then it might be worth creating a custom field type instead.

For example, let's say you have a form which takes as input two dates forming a date range:

```js
"use strict";

module.exports = {
  fields: [
    {
      name: 'startDate',
      type: 'text',
      required: true,
      sanitizers: ['trim', { id: 'lib', method: 'toDate' }],
      validators: ['notEmpty'],
    },
    {
      name: 'endDate',
      type: 'password',
      required: true,
      sanitizers: ['trim', { id: 'lib', method: 'toDate' }],
      validators: ['notEmpty', {id: 'compareToField', field: 'startDate', comparison: 'gt'}],
    },
  ],
};
```

The above field specifications will work well enough that once the form submission has been processed, both `startDate` and `endDate` will be `Date` instances. But it's tedious to have to remember to apply the correct list of sanitizers to every text field that actually represents a date.

We could instead create a `date` field type which internally does the right thing.

```js
// file: <project folder>/src/support/forms/fields/date.js
"use strict";

const validator = require('validator');

const waigo = global.waigo,
  _ = waigo._,
  TextField = waigo.load('support/forms/fields/text');

class DateField extends TextField {
  constructor(form, config) {
    super(form, config);

    this._addSanitizer('trim');
    this._addSanitizer({ 
      id: 'lib',
      method: 'toDate'
    });
  }
}

module.exports = DateField;
```

*Note: All custom field types should be placed in the `support/forms/fields` loader path.*

Now we can use this new type in the form specification:

```js
"use strict";

module.exports = {
  fields: [
    {
      name: 'startDate',
      type: 'date',
      required: true,
      validators: ['notEmpty'],
    },
    {
      name: 'date',
      type: 'password',
      required: true,
      validators: ['notEmpty', {id: 'compareToField', field: 'startDate', comparison: 'gt'}],
    },
  ],
};
```

This has not only simply followed the form specification, it has made the field description more semantically meaningful. For instance, our front-end client code can now choose to display a date picker UI just by seeing that the field type is `date`. Previously it would have had to infer the type of UI to display based on the fields' sanitizer lists or some other information we provided.

Furthermore, we can now add additional sanitizers and validators and other logic within our new `DateField` class, and make the `date` field type as powerful as we want.
