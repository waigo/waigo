# Error middleware

The [error handling middleware](https://github.com/waigo/waigo/blob/master/src/support/middleware/errorHandler.js) is responsible for catching and dealing with any errors thrown during the servicing of an incoming 
request. 

Errors get logged through the default App logger as well as getting sent back 
to the client which made the original request. The HTTP response status code 
will be set to the status code set within the thrown error (or 500 if not 
set). The error [view template](https://github.com/waigo/waigo/blob/master/src/views/error.pug) is used to render the error for 
the user if the client requested a HTML response. If the requested a JSON 
response then the raw JSON of the error will be returned. 

The error middleware also adds a convenience method - `throw()` to the current 
Koa request context, allowing you to more easily throw an instance of the 
defined error classes:


```javascript
// file: <project folder>/src/controllers/index.js
"use strict";

const waigo = require('waigo'),
  MultipleError = waigo.load('support/errors').MultipleError;

exports.main = function*() {
  this.throw('this will be a RuntimeError instance');
  this.throw(MultipleError, 'this will be a RuntimeError instance');
};
```

