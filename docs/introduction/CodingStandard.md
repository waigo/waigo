# Coding standard

Waigo's codebase adheres to certain principles. We recommend you do so for your app too, to ensure maximum interoperability with Waigo code.

## 1. No callbacks

Callbacks are out, [Promises](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise) and [Generator Functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*) are in. This is party because Koa (the middleware framework underlying Waigo) uses generators, and partly because this way code is easier to write, easier to understand, and [just as performant](https://spion.github.io/posts/why-i-am-switching-to-promises.html).

If an external API utilises callbacks then simply wrap it in a Promise. For example:

```js
"use strict";

const waigo = require('waigo'),
    Q = waigo.load('support/promise');

const getFileCallback = function(cb) {
  ...
  cb(err, result);
};

const getFilePromise = Q.promisify(getFileCallback);

// now we can use it within a generator!
const main = function*() {
  let result = yield getFilePromise();
  
  console.log(result);
}
```

Ensure your own methods return Promises or are Generator Functions. Don't use callbacks.

## 2. Internal items are prefixed with "_"

For example, if a class field or method name is prefixed with one or more underscores then it is considered *internal* to that class - do not access it from outside the class. Here's a real example using Waigo's ACL class:

```js
class 
```

