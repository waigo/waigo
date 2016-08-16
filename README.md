# Waigo

[![Build Status](https://secure.travis-ci.org/waigo/waigo.png)](http://travis-ci.org/waigo/waigo)
[![NPM module](https://badge.fury.io/js/waigo.png)](https://npmjs.org/package/waigo)
[![Waigo channel on discord](https://img.shields.io/badge/discord-waigo-738bd7.svg?style=flat-square)](https://discord.gg/Jf3pGjf)
[![Join the chat at https://gitter.im/waigo/waigo](https://badges.gitter.im/waigo/waigo.svg)](https://gitter.im/waigo/waigo?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

\[ [Getting started](https://waigojs.com/docs/) • [Docs](https://waigojs.com/docs/) • [API](http://waigojs.com/api/) • [Examples](http://waigojs.com/examples/) • [Sites](http://waigojs.com/sites.html) \]


Waigo is a Node.js ES6 framework for building web apps and API back-ends which 
are easy to maintain and improve, and easy to scale.

Quick overview:

 * Built on [koa](http://koajs.com/), uses Promises and Generators, no callbacks.
 * Uses [RethinkDB](http://rethinkdb.com) for end-to-end reactive data pipeline.
 * Build APIs and output both HTML and JSON for every route.
 * Flexible routing with per-route and per-HTTP-method middleware customisation.
 * Customizabe logging framework.
 * Form validation and sanitization CSRF protection.
 * User accounts, roles and access control lists. OAuth supported.
 * Emailing system with email templating support.
 * Slack notifications, fully configurable.
 * Command-line client for quick and easy setup
 * Pluggable admin interface (see [waigo-plugin-admin](https://github.com/waigo/admin)).
 * Cron jobs.
 * Node.js clustering (multi-process) scaling support.
 * Extend or override _any_ part of the core framework.
 * Bundle up functionality and customizations into re-usable plugins (NPM modules).
 * And much, much more...


## Documentaton

Full documentation can be found in the `/docs/` folder. The same docs 
can also be read online at [waigojs.com/docs](https://waigojs.com/docs/).

**Note: Waigo v2 (current major version) was only recently completed, and as such docs are still a work in progress. The old v1 docs can be found at [waigojs.com/v1](https://waigojs.com/v1/)**


## Development 

_Note: This section tells you to build Waigo itsef. For building apps with Waigo 
please [read the docs](https://waigojs.com/docs/) instead._

Requirements:

  * Node.js 4.4.5+
  * RethinkDB 2.2+

First install the dependencies:

```bash
$ npm install
```

Now you can run the development server using:

```bash
$ npm run dev
```

This will watch assets and source code for changes and rebuild and reload the 
browser page when necessary.

If you install [gulp](http://gulpjs.com/-) globally then you can also run it directly:

```bash
$ npm install -g gulp
$ gulp dev
```

Running it directly lets you pass in additional options. For example, by 
default assets are not minified. To enable minification use the `--debug` flag:

```bash
$ gulp dev --minified
```

## Testing

```bash
$ gulp test
```

This will run all the tests. To limit testing to one more test files use the 
`--only-test` option:

```bash
$ gulp test --only-test test/unit/src/support/*.test.js
```

## Waigo v1

Version 1 is the old version of Waigo and uses Mongo instead of RethinkDB. This 
version is no longer being maintained but feel free to fork it from the `v1` 
branch in the repo. Docs can be found [waigojs.com/v1](https://waigojs.com/v1/).


## Contributing

Suggestions, bug reports and pull requests are welcome. Please see [CONTRIBUTING.md](https://github.com/waigo/waigo/blob/master/CONTRIBUTING.md) for guidelines.

## License

MIT - see [LICENSE.md](https://github.com/waigo/waigo/blob/master/LICENSE.md)

