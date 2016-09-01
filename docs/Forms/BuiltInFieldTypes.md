# Built-in field types

Waigo offers a number of built-in field types to get you started when building forms:

* [checkbox](https://github.com/waigo/waigo/blob/master/src/support/forms/fields/checkbox.js) - represents a checkbox. This has a default sanitiser which auto-converts the input to a boolean.
* [csrf](https://github.com/waigo/waigo/blob/master/src/support/forms/fields/csrf.js) - represents a CSRF-prevention field. It has a default validator which validates the submitted value. Waigo automatically adds a CSRF-prevention field to your forms, but you can use this field type directly too if you so wish.
* [email](https://github.com/waigo/waigo/blob/master/src/support/forms/fields/email.js) - represents an email field. All inputs are validated as email addresses.
* [hidden](https://github.com/waigo/waigo/blob/master/src/support/forms/fields/hidden.js) - represents a hidden field. No special processing is performed on the input.
* [number](https://github.com/waigo/waigo/blob/master/src/support/forms/fields/number.js) - represents a number field. It has a default sanitiser which auto-converts the input to a number.
* [password](https://github.com/waigo/waigo/blob/master/src/support/forms/fields/password.js) - represents a password field. No special processing is performed on the input.
* [select](https://github.com/waigo/waigo/blob/master/src/support/forms/fields/select.js) - represents a dropdown selector with optional multi-option selection enabled. The input is validated to ensure that all the selected options match what's available in the predefined options list.
* [text](https://github.com/waigo/waigo/blob/master/src/support/forms/fields/text.js) - represents a text input field. No special processing is performed on the input.
