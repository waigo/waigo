# What is Waigo?

\[ [Guide](http://waigojs.com/guide.html) • [API](http://waigojs.com/api/) • [Examples](http://waigojs.com/examples/) • [Sites](http://waigojs.com/sites.html) \]

[![Build Status](https://secure.travis-ci.org/waigo/waigo.png)](http://travis-ci.org/waigo/waigo) [![NPM module](https://badge.fury.io/js/waigo.png)](https://npmjs.org/package/waigo) [![Code quality](https://codeclimate.com/github/waigo/waigo.png)](https://codeclimate.com/github/waigo/waigo)

Waigo is a Node.js framework for building scalable and maintainable web 
application back-ends.

**Git: master branch contains v2 which is in development. For v1 check out the 
`v1` branch**

Quick overview:

 * Based on [koa](http://koajs.com/), uses ES6 generators, no callbacks
 * Database, model-layer and front-end agnostic - use whatever you want
 * Easily build REST/JSON APIs using [output formats](#views-and-output-formats)
 * Flexible routing with [per-route middleware](#routing) customisation
 * Easily build [forms](#forms) with sanitization and validation
 * [Extend](#extend-and-override) or override _any_ part of the core framework
 * Bundle up functionality into re-usable [plugins](#plugins)
 * And much, [much more](http://waigojs.com)..
 

# Development 

We recommend using **Node 0.12.0+** for Waigo. You will also need to have a 
MongoDB replica set running at `127.0.0.1:27017`.

While developing the framework run the server using:

```bash
$ gulp
```

This will watch assets and source code for changes and rebuild and reload 
on-the-fly.

By default assets are minified. To avoid this use the `--debug` flag:

```bash
$ gulp --debug
```


# Roadmap

See the [Github issue queue](https://github.com/waigo/waigo/issues).


# Contributing

Suggestions, bug reports and pull requests are welcome. Please see [CONTRIBUTING.md](https://github.com/waigo/waigo/blob/master/CONTRIBUTING.md) for guidelines.

# License

MIT - see [LICENSE.md](https://github.com/waigo/waigo/blob/master/LICENSE.md)

