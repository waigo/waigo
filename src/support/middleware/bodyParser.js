"use strict";


var _ = require('lodash'),
  bodyParser = require('co-body'),
  path = require('path'),
  waigo = require('../../../');

/**
 * # Middleware: request body parser
 *
 * This middleware uses [co-body](https://github.com/visionmedia/co-body) to parse request POST bodies.
 */


/**
 * Build middleware for parsing request bodies.
 *
 * Once parsed the request body parameters are available in `this.request.body`.
 * 
 * @param {Object} options Configuration options.
 * @param {Object} options.app The application.
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

