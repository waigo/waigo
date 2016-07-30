# Creating your own

Defining and using your own error classes will allow you to better pinpoint the 
location and causes of thrown errors when debugging error output. Better yet, 
extend Waigo's built-in error classes and your custom errors will obtain all 
of their benefits.

You can define a custom error using the `define()` method:

```javascript
const errors = waigo.load('support/errors');

const UserNotFoundError = errors.define('UserNotFoundError');
// UserNotFoundError extends RuntimeError

...

throw UserNotFoundError('...');
```

The `define()` call takes a second parameter indicating the parent class to inherit 
from (default is `RuntimeError`). Thus you can define a custom error class which 
acts as parent class to other custom errors:

```javascript
const ProcessingErrors = errors.define('ProcessingErrors', errors.MultipleError);
const ValidationErrors = errors.define('ValidationErrors', ProcessingErrors);
```

