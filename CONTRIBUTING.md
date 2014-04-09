# Contributing to Waigo

1. [Directory structure](#directory-structure)
2. [Scripts](#scripts)
3. [Style guide](#style-guide)
5. [Testing](#testing)

## Directory structure

- `/src` contains framework source code

- `/test` contains tests using the mocha framework

- `/docs` empty folder in which API docs get built when you run `grunt api_docs`

## Scripts

`/Gruntfile.js` contains tasks to lint, build and test the code

`/index.js` the initial script which loads the framework

## Style guide

Use the same style as is used in the surrounding code.

###Whitespace

- Try not to use more than 80 columns per line
- 2 space indentation
- No trailing whitespace
- LF at end of files
- Curly braces must always be present for `if/for/while` usages.
- Add an additional new line between logical sections of code.

###Variables

- Use `let` unless `var` is required for the semantics
- It's ok to use a single `var` statement with comma separator
- Try not declare variables until you need them

###Error handling

- Instead of throwing an `Error` throw one of the error classes in [support/errors](https://github.com/waigo/waigo/blob/master/src/support/errors.js)
- Feel free to subclass the built-in error classes to create your own (use the provided `define()` method to create a subclass)

###Equality and type checks

- Always use `===`.
- Use defensive programming, i.e. `1 === myVar` rather than `myVar === 1`.

## Testing

- Ensure build passes by running `node --harmony ``which grunt`` ` after you have made your changes.
- Ensure you update and improve any tests impacted by your changes. Write new tests if necessary to ensure all your code is tested.

