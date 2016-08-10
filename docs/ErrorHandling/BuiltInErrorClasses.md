# Built-in Error classes

Waigo provides you with built-in `Error` subclasses for raising exceptions with. 
These classes provide a few conveniences beyond the base `Error` class and are 
worth using within your own back-end code. They can are defined within the 
`support/errors` file:

```javascript
const errors = waigo.load('support/errors');
```

## RuntimeError

The `RuntimeError` class is the base class for all other errors in Waigo.
It allows you to set a HTTP status code and an additional `details` object along 
with the error message. This status code is used by the
[error middleware](ErrorMiddleware.md) when generating the final HTTP response:

```javascript
// file: <project folder>/controllers/index.js
"use strict";

const waigo = require('waigo'),
  RuntimeError = waigo.load('support/errors').RuntimeError;

exports.index = function*(next) {
  throw new RuntimeError('oh dear!', 400, {
    some: 'data',
  }); // 400 = bad request
}
```

For the above code the browser will receive a response with HTTP status code 400 
and, if using the JSON format, will display:

```javascript
{
    type: "RuntimeError",
    msg: "oh dear!",
    details: {
        some: "data"
    },
    stack: [...]
    status: 400,
    request: {
        method: "GET",
        url: "/?format=json"
    }
}
```

_Note: Stack traces only get sent to the client if the `app.config.errorHandler.showStack` flag is `true`._


## MultipleError

The `MultipleError` class is derived from `RuntimeError` and represents a 
group of relatederrors. The 3rd `details` parameter is assumed to represent a 
collection of `Error` objects. 

```javascript


throw new MultipleError('oh dear!', 403, {
  firstError: new RuntimeError('fail1'),
  secondError: new Error('test')
});
```

The JSON response to the client would have a HTTP status code of 403 and look like:

```javascript
{
    type: "MultipleError",
    msg: "oh dear!",
    details: {
        firstError: {
            type: "RuntimeError",
            msg: "fail1",
            stack: "..."
        },
        secondError: {
            type: "Error",
            msg: "test",
            stack: "..."
        }
    },
    stack: [...],
    status: 403,
    request: {
        method: "GET",
        url: "/?format=json"
    }
}
```

