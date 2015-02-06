"use strict";


var debug = require('debug')('waigo-render-html'),
  path = require('path'),
  waigo = require('../../../'),
  _ = waigo._;

var errors = waigo.load('support/errors');



/**
 * JSON output format.
 *
 * @return {Object} Object with render method.
 */
exports.create = function() {
  return {
    render: function*(view, locals) {
      debug('View', view);

      locals = locals || {};

      if (!_.isPlainObject(locals)) {
        throw new errors.RuntimeError('Plain object required for JSON output format');
      }

      this.body = locals;
      this.type = 'json';
    },


    redirect: function*(url) {
      debug('Redirect', url);
      
      this.type = 'json';
      this.status = 200;
      this.body = {
        redirectTo: url
      };
    },
  };
};


