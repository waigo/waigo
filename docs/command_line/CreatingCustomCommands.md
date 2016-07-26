# Creating custom commands

Every CLI command is implemented a file within `<waigo npm folder>/src/cli`. If you wish to add your own commands or override the defaults then you must also place your implementations within `<app folder>/src/cli`. The 
CLI executable scans this path at startup and loads in all available commands. 

All CLI commands must be implemented as concrete subclasses of 
[`AbstractCommand`](https://github.com/waigo/waigo/blob/master/src/support/cliCommand.js). This 
base class provides a number of useful utility methods for use by actual 
commands.
