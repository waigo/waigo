var _ = require('lodash'),
  path = require('path'),
  views = require('co-views'),
  waigo = require('../../../');


/**
 * Create an instance of this view format.
 * @param config {Object} configuration for this view format.
 */
exports.create = function(config) {
  var _render = views(path.join(waigo.getAppFolder(), config.folder), { 
    ext: config.ext,
    map: config.engine || null 
  });

  return {
    render: function*(view, locals) {
      this.body = yield _render(view, _.extend({}, locals, this.app.locals));
      this.type = 'html';
    }
  };
};


