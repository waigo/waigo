# Creating your own

## Custom errors

It is highly recommended that you define and use your own error classes as they
will allow you to better poinpoint the cause of errors. The `support/errors`
module provides functionality to make this easy:

```javascript
var errors = waigo.load('support/errors');

var UserNotFound = errors.define('FormValidationError');
// UserNotFound inherits from RuntimeError

...

throw UserNotFound('...');
```

The second parameter to the `define()` call is the parent class to inherit 
from. A custom error class can even inherit from another one:

```javascript
var errors = waigo.load('support/errors');

var ProcessingErrors = errors.define('ProcessingErrors', errors.MultipleError);
// ProcessingErrors inherits from MultipleError

var ValidationErrors = errors.define('ValidationErrors', ProcessingErrors);
// ValidationErrors inherits from ProcessingErrors
```




The `support/middleware/errorHandler` middleware is responsible for handling all
errors which get thrown during the request handling process. Errors get logged
through the default logger as well as getting sent back to the client which made
the original request.

