"use strict";

var views = require('co-views'),
  waigo = require('../../../');

var errors = waigo.load('support/errors'),
  mixins = waigo.load('support/mixins');


var viewObjectMethod = Object.keys(mixins.HasViewObject).pop();




/**
 * Get generator for converting given template variable into a view object.
 *
 * @param {Object} ctx Current request context.
 * @param  {*} templateVar Template variable.
 * @return {Generator}
 * @private
 */
var toViewObjectGenerator = function(ctx, templateVar) {
  // has view object method
  if (templateVar[viewObjectMethod]) {
    return templateVar[viewObjectMethod].call(templateVar, ctx);
  } 
  // is an array
  else if (templateVar instanceof Array) {
    // recursive call on all children
    return templateVar.map(function(local) {
      return toViewObjectGenerator(ctx, local);
    });
  }
  // everything else
  else {
    return templateVar;
  }

};






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
      var viewObjectGenerators = {};
      for (let idx in locals) {
        viewObjectGenerators[idx] = toViewObjectGenerator(ctx, locals[idx]);
      }

      var viewObjects = yield viewObjectGenerators;

      // call actual rendering method
      yield enabledFormats[requestedFormat].render.call(ctx, view, viewObjects);
    }


    yield next;
  };
};



