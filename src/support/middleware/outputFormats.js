"use strict";

var views = require('co-views'),
  waigo = require('../../../');

var errors = waigo.load('support/errors'),
  mixins = waigo.load('support/mixins');


var viewObjectMethod = Object.keys(mixins.HasViewObject).pop();




/**
 * Build output formats middleware.
 * @param {Object} options Configuration options.
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
      // convert each local to a view object
      var viewObjectCalls = {};
      for (let idx in locals) {
        let local = locals[idx];

        if (local[viewObjectMethod]) {
          viewObjectCalls[idx] = local[viewObjectMethod].call(local, ctx);
        } else {
          viewObjectCalls[idx] = local;
        }
      }
      var viewObjects = yield viewObjectCalls;

      // call actual rendering method
      yield enabledFormats[requestedFormat].render.call(ctx, view, viewObjects);
    }


    yield next;
  };
};



