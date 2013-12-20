var _ = require('lodash'),
  path = require('path'),
  Promise = require('bluebird'),
  views = require('co-views'),
  waigo = GLOBAL.waigo;


/**
 * Create an instance of this view format.
 * @param config {Object} configuration for this view format.
 */
exports.create = function(config) {
  var _render = views(path.join(waigo.getAppFolder(), config.folder), { ext: config.ext });

  return {
    render: function*(view, locals) {
      this.body = yield _render(view, locals || {});
      this.type = 'html';
    }
  };
};


