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

- No more than 80 columns per line
- 2 space indentation
- No trailing whitespace
- LF at end of files
- Curly braces must always be present for `if/for/while` usages.
- Add an additional new line between logical sections of code.

###Variables

- Use `let` unless `var` is required for the semantics
- It's ok to use a single `var` statement with comma separator
- Try not declare variables until you need them

###Equality and type checks

- Always use `===`.
- Use defensive programming, i.e. `1 === myVar` rather than `myVar === 1`.

## Testing

- Ensure JSHint and all tests pass by running `grunt build` after you have made your changes.
- Ensure you update and improve any tests impacted by your changes. Write new tests if necessary to ensure all your code is tested.

