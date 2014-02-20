'use strict';

var views = require('co-views'),
  waigo = require('../../../');

var BaseError = waigo.load('support/errors').BaseError;

/**
 * Build view formats middleware.
 * @param config {Object} output format config.
 * @return {Function} Express middleware.
 */
module.exports = function(config) {
  var enabledFormats = {};

  var formatNames = Object.keys(config.formats);
  for (let i=0; i<formatNames.length; ++i) {
    let format = formatNames[i];
    enabledFormats[format] = waigo.load('support/viewFormats/' + format).create(config.formats[format]);    
  }

  return function* setViewFormat(next) {
    var requestedFormat = (this.query[config.paramName] || config.default).toLowerCase();

    // check format is valid
    if (requestedFormat && !enabledFormats[requestedFormat]) {
      throw new BaseError('Invalid view format requested: ' + requestedFormat, 400);
    }

    // if all ok then attach renderer
    this.render = enabledFormats[requestedFormat].render;
    this.request.viewFormat =requestedFormat; // so that we middleware further down the chain can use

    yield next;
  };
};



