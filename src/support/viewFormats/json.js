var _ = require('lodash'),
  path = require('path'),
  waigo = require('../../../');

var BaseError = waigo.load('support/errors').BaseError;


/**
 * Create an instance of this view format.
 * @param config {Object} configuration for this view format.
 */
exports.create = function(config) {
  return {
    render: function*(view, locals) {
      locals = locals || {};

      if (!_.isPlainObject(locals)) {
        throw new BaseError('Plain object required for JSON view format');
      }

      this.body = locals;
      this.type = 'json';
    }
  };
};


