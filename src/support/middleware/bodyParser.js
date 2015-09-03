"use strict";


var bodyParser = require('co-body'),
  path = require('path'),
  waigo = global.waigo,
  _ = waigo._;


/**
 * Build middleware for parsing request bodies.
 *
 * This middleware uses [co-body](https://github.com/visionmedia/co-body) to 
 * parse request POST bodies. Once parsed the request body parameters are 
 * available in `this.request.body`.
 *
 * If `csrf` middleware is enabled is set then this validates the csrf.
 * 
 * @param {Object} options Configuration options for `co-body`.
 * @param {String} [options.limit] The maximum allowed size of a request body.
 * 
 * @return {Function} middleware
 */
var fn = module.exports = function(options) {
  return function*(next) {
    this.request.body = yield fn._bodyParser(this, options);

    yield next;
  };
};
// we attach actual parser to the function to make unit testing easier
fn._bodyParser = require('co-body');

