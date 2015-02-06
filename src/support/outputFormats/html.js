"use strict";


var _ = require('lodash'),
  debug = require('debug')('waigo-render-html'),
  path = require('path'),
  render = require('co-render'),
  waigo = require('../../../');


/**
 * HTML output format.
 *
 * @param {Object} config configuration for this output format.
 * @param {String} config.folder View templates folder, relative to application root folder.
 * @param {String} config.ext Default template file extension.
 * @param {String} config.engine Default template rendering engine.
 *
 * @return {Object} Object with `render` and `redirect` methods.
 */
exports.create = function(config) {
  return {
    render: function*(view, locals) {
      // what type of template is this?
      var ext = path.extname(view).slice(1);  // slice(1) to remove '.' prefix
      if (!ext.length) {
        ext = config.ext;
      }

      debug('Template type', ext);

      // get locals
      locals = _.extend({}, this.app.locals, this.locals, locals, {
        cache: !!config.cache,
        engine: config.engine[ext],
      });

      // get full path to view file
      view = waigo.getPath('views/' + view + '.' + ext);

      debug('Template path', view);

      this.body = yield render(view, locals);
      this.type = 'html';
    },

    redirect: function*(url) {
      debug('Redirect', url);

      this.response.redirect(url);
    },
  };
};




