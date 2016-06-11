# Coding standard

Waigo's codebase adheres to certain principles. We recommend you do so for your app too, to ensure maximum interoperability with Waigo code:

* **Callbacks are out**. [Promises](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise) and [Generator Functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*) are in. This allows for writing code which is highly asynchronous, yet appears synchronous. Code is cleaner and easier to understand - and this extends to the test suite. If an external API utilises callbacks then simply wrap it in a Promise. Ensure your own methods return Promises or are Generator Functions. Don't use callbacks.

* **Items with underscore (`_`) are internal to their container**. For example, if a class field or method name is prefixed with one or more underscores then it is considered *internal* to that class - do not access it from outside the class.

