"use strict";

var views = require('co-views'),
  waigo = require('../../../');

var errors = waigo.load('support/errors'),
  viewObjects = waigo.load('support/viewObjects');






/**
 * Build output formats middleware.
 *
 * Each format specified in `options.formats` is a key-value mapping where the 
 * key is the canonical name of the format and the mapped value specifies the 
 * configuration options for the format. See [html](../outputFormats/html.js.html) and 
 * [json](../outputFormats/json.js.html) for more details.
 * 
 * @param {Object} options Configuration options.
 * @param {Object} [options.formats] The supported formats.
 * @param {String} [options.default] Default format when none is specified.
 * @param {String} [options.paramName] Name of format query parameter.
 * 
 * @return {Function} Express middleware.
 */
module.exports = function(options) {
  var enabledFormats = {};

  var formatNames = Object.keys(options.formats);
  for (let i=0; i<formatNames.length; ++i) {
    let format = formatNames[i];
    enabledFormats[format] = waigo.load('support/outputFormats/' + format).create(options.formats[format]);
  }

  return function* setoutputFormat(next) {
    var ctx = this;

    var requestedFormat = (this.query[options.paramName] || options.default).toLowerCase();

    // check format is valid
    if (requestedFormat && !enabledFormats[requestedFormat]) {
      throw new errors.RuntimeError('Invalid output format requested: ' + requestedFormat, 400);
    }

    this.request.outputFormat = requestedFormat;

    // attach renderer
    this.render = function*(view, locals) {
      
      // get generators for converting locals into view objects
      var viewObjectYieldables = {};
      for (let idx in locals) {
        viewObjectYieldables[idx] = viewObjects.toViewObjectYieldable(ctx, locals[idx]);
      }

      var localsViewObjects = yield viewObjectYieldables;

      // call actual rendering method
      yield enabledFormats[requestedFormat].render.call(ctx, view, localsViewObjects);
    }

    yield next;
  };
};



