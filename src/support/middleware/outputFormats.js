var _ = require('lodash'),
  waigo = GLOBAL.waigo;

var BaseError = waigo.load('support.errors').BaseError;

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

  return function* outputFormat(next) {
    var requestedFormat = (this.query[config.paramName] || config.default).toLowerCase();

    // check format is valid
    if (requestedFormat && !availableFormats[requestedFormat]) {
      throw new BaseError('Invalid output format requested: ' + requestedFormat, 400);
    }

    // if all ok then attach renderer
//    this.render =
    this.res.outputFormatter = availableFormats[requestedFormat];

    yield next;
  };
};



