# Creating custom commands

You can override the functionality of Waigo's default CLI commands and/or add your own custom commands to the list.

Every CLI command is implemented in a file within the `src/cli`.This folder gets indexed by the Waigo module lader. 

Thus if you wish to add your own commands or override the defaults then you must place your implementations within `<project folder>/src/cli`. 

For example, let's add a command called `start` which will start the app:

```javascript
// <project folder>/src/cli/start.js
"use strict";

const path = require('path'),
  util = require('util');

const waigo = require('waigo'),
  AbstractCommand = waigo.load('support/cliCommand');
  
/**
 * The "start" CLI command.
 *
 * This command runs the Waigo application.
 */
class Command extends AbstractCommand {
  constructor() {
    super('Start the app', []);
  }

  /**
   * Run this command.
   */
  * run () {
    yield waigo._bootstrap();
  }
}

module.exports = Command;
```

All CLI commands must be implemented as concrete subclasses of [`AbstractCommand`](https://github.com/waigo/waigo/blob/master/src/support/cliCommand.js). This base class provides a number of useful utility methods for use by actual commands. Take a look at the [init-gulp](https://github.com/waigo/waigo/blob/master/src/cli/init-gulp.js) code to see these in action.
