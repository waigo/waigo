# Contributing to Waigo

1. [Directory structure](#directory-structure)
2. [Scripts](#scripts)
3. [Style guide](#style-guide)
5. [Testing](#testing)

## Directory structure

- `/src` contains framework source code

- `/test` contains tests using the mocha framework

- `/docs` contains documentaiton for the framework

- `/public` contains built front-end assets

- `/gulp` contains gulp scripts

- `/bin` contains command-line (CLI) executable

## Scripts

`/gulpfile.coffee` contains tasks to build and test the code

`/start-app.js` the initial script which loads and runs the framework

## Style guide

Use the same style as is used in the surrounding code.

### Whitespace

- Try not to use more than 80 columns per line
- 2 space indentation
- No trailing whitespace
- LF at end of files
- Curly braces must always be present for `if/for/while` usages.
- Add an additional new line between logical sections of code.

### Variables

- Use `let` unless `var` is required for the semantics
- Use `const` wherever possible to prevent subtle change-of-value bugs
- It's ok to use a single `let` or `const` statement with comma separator
- Try not declare variables until you need them

### Error handling

- Instead of throwing an `Error` throw one of the error classes in [support/errors](https://github.com/waigo/waigo/blob/master/src/support/errors.js)
- Feel free to subclass the built-in error classes to create your own (use the provided `define()` method to create a subclass)

### Equality and type checks

- Always use `===`.
- Use defensive programming, i.e. `1 === myVar` rather than `myVar === 1`.

## Testing

- Ensure tests pass by running `npm run test` after you have made your changes.
- Ensure you update and improve any tests impacted by your changes. Write new tests if necessary to ensure all your code is tested.

