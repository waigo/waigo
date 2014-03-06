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
 * @param {String} [options.limit] The maximum allowed size of a request body.
 * 
 * @return {Function} middleware
 */
module.exports = function(options) {
  return function*(next) {
    this.request.body = yield bodyParser(this, options);
    yield next;
  };
};

