"use strict";

const waigo = global.waigo,
  _ = waigo._,
  logger = waigo.load('support/logger').create('OutputFormats'),
  errors = waigo.load('support/errors'),
  viewObjects = waigo.load('support/viewObjects');


const OutputFormatError = errors.define('OutputFormatError');





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
  let app = waigo.load('application').app;

  let enabledFormats = {};

  let formatNames = Object.keys(options.formats);

  for (let format of formatNames) {
    enabledFormats[format] = 
      waigo.load(`support/outputFormats/${format}`).create(
        logger.create(format), 
        options.formats[format]
      );
  }

  return function* setOutputFormat(next) {
    let ctx = this,
      app = ctx.app;
      

    let requestedFormat = 
      _.get(this.query, options.paramName, options.default).toLowerCase();

    // check format is valid
    if (requestedFormat && !enabledFormats[requestedFormat]) {
      throw new OutputFormatError(`Invalid output format requested: ${requestedFormat}`, 400);
    }

    this.request.outputFormat = requestedFormat;

    logger.debug('Output format', requestedFormat);

    // attach renderer
    this.render = function*(view, locals, options) {
      locals = locals || {};
      options = options || {};
      
      logger.debug('Render', view);

      // set status code
      if (options.status) {
        this.status = options.status;
      }

      // get yieldables
      let localsViewObjects = yield viewObjects.toViewObjectYieldable(locals, ctx);

      // call actual rendering method
      yield enabledFormats[requestedFormat].render.call(ctx, view, localsViewObjects);
    };

    // redirect method
    this.redirect = function*(url) {
      logger.debug('Redirect', url);

      // call actual rendering method
      yield enabledFormats[requestedFormat].redirect.call(ctx, url);
    };


    yield next;
  };
};



