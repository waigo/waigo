


const path = require('path'),
  render = require('co-render');

const waigo = global.waigo,
  _ = waigo._;


/**
 * HTML output format.
 *
 * @param {Object} logger Logger to use.
 * @param {Object} config configuration for this output format.
 * @param {String} config.folder View templates folder, relative to application root folder.
 * @param {String} config.ext Default template file extension.
 * @param {String} config.engine Default template rendering engine.
 *
 * @return {Object} Object with `render` and `redirect` methods.
 */
exports.create = function(logger, config) {
  return {
    render: function*(view, templateVars) {
      // what type of template is this?
      var ext = path.extname(view).slice(1);  // slice(1) to remove '.' prefix
      if (!ext.length) {
        ext = config.ext;
      }

      logger.debug('Template type', ext);

      // get templateVars
      templateVars = _.extend({}, this.App.templateVars, this.templateVars, templateVars, {
        cache: !!config.cache,
        engine: config.engine[ext],
      });

      // get full path to view file
      view = waigo.getPath('views/' + view + '.' + ext);

      logger.debug('Template path', view);

      this.body = yield render(view, templateVars);
      this.type = 'html';
    },

    redirect: function*(url) {
      logger.debug('Redirect', url);

      this.response.redirect(url);
    },
  };
};




