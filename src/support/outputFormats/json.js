var _ = require('lodash'),
  path = require('path'),
  waigo = require('../../../');

var BaseError = waigo.load('support/errors').BaseError;


/**
 * Create an instance of this output format.
 * @param config {Object} configuration for this output format.
 */
exports.create = function(config) {
  return {
    render: function*(view, locals) {
      locals = locals || {};

      if (!_.isPlainObject(locals)) {
        throw new BaseError('Plain object required for JSON output format');
      }

      this.body = locals;
      this.type = 'json';
    }
  };
};


