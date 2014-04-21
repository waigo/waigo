"use strict";


var _ = require('lodash'),
  path = require('path'),
  waigo = require('../../../');

var errors = waigo.load('support/errors');



/**
 * JSON output format.
 *
 * @return {Object} Object with render method.
 */
exports.create = function() {
  return {
    render: function*(view, locals) {
      locals = locals || {};

      if (!_.isPlainObject(locals)) {
        throw new errors.RuntimeError('Plain object required for JSON output format');
      }

      this.body = locals;
      this.type = 'json';
    }
  };
};


