"use strict";


var _ = require('lodash'),
  path = require('path'),
  views = require('co-views'),
  waigo = require('../../../');


/**
 * Create an instance of this output format.
 * @param config {Object} configuration for this output format.
 */
exports.create = function(config) {
  var render = views(path.join(waigo.getAppFolder(), config.folder), {
    ext: config.ext,
    map: config.engine || null
  });

  return {
    render: function*(view, locals) {
      this.body = yield render(view, _.extend({}, this.app.locals, locals));
      this.type = 'html';
    }
  };
};


