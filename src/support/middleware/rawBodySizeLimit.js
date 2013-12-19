/*
 Limit size of raw uploaded body content for a given request.
 */


var getRawBody = require('raw-body');


/**
 * @param config {Object} config options.
 * @param config.limitMb {Number} size limit in MB.
 */
module.exports = function(config) {
  return function*(next) {
    yield getRawBody(this.req, {
      length: this.length,
      limit: config.limitMb + 'mb',
      encoding: 'utf8'
    });

    yield next;
  }
};
