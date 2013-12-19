var _ = require('lodash'),
  waigo = GLOBAL.waigo;

/**
 * Build output formats middleware.
 * @param config {Object} output format config.
 * @return {Function} Express middleware.
 */
module.exports = function(config) {
  config = _.extend({
    enabled: ['html', 'json'],
    paramName: 'format',
    default: 'html'
  }, config);

  var availableFormats = {};
  _.each(config.enabled, function (format) {
    availableFormats[format] = waigo.load('support.outputFormats.' + format);
  });

  return function*(next) {
    var requestedFormat = (this.req.query[config.paramName] || config.default).toLowerCase();

    // check format is valid
    if (requestedFormat && !availableFormats[requestedFormat]) {
      return next(new Error('Invalid output format requested: ' + requestedFormat));
    }

    // if all ok then attach the output format to the response object
    res.outputFormatter = availableFormats[requestedFormat];

    yield next;
  };
};



