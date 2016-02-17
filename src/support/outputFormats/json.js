"use strict";


const path = require('path');

const waigo = global.waigo,
  _ = waigo._,
  errors = waigo.load('support/errors');


const JsonRenderError = errors.define('JsonRenderError');



/**
 * JSON output format.
 *
 * @param {Object} logger Logger to use.
 * @return {Object} Object with render method.
 */
exports.create = function(logger) {
  return {
    render: function*(view, locals) {
      logger.debug('View', view);

      locals = locals || {};

      if (!_.isPlainObject(locals)) {
        throw new JsonRenderError('Plain object required for JSON output format');
      }

      this.body = locals;
      this.type = 'json';
    },


    redirect: function*(url) {
      logger.debug('Redirect', url);
      
      this.type = 'json';
      this.status = 200;
      this.body = {
        redirectTo: url,
      };
    },
  };
};


