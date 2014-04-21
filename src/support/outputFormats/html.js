"use strict";


var _ = require('lodash'),
  path = require('path'),
  views = require('co-views'),
  waigo = require('../../../');


/**
 * HTML output format.
 *
 * @param {Object} config configuration for this output format.
 * @param {String} config.ext Default template file extension.
 * @param {String} config.engine Default template rendering engine.
 *
 * @return {Object} Object with render method.
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


