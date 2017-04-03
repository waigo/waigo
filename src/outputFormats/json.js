


const path = require('path')

const waigo = global.waigo,
  _ = waigo._,
  errors = waigo.load('support/errors')


const JsonRenderError = errors.define('JsonRenderError')



/**
 * JSON output format.
 *
 * @param {Object} logger Logger to use.
 * @return {Object} Object with render method.
 */
exports.create = function (logger) {
  return {
    render: function *(view, templateVars) {
      logger.debug('View', view)

      templateVars = templateVars || {}

      if (!_.isObject(templateVars)) {
        throw new JsonRenderError('Object required for JSON output format')
      }

      this.body = templateVars
      this.type = 'json'
    },


    redirect: function *(url) {
      logger.debug('Redirect', url)
      
      this.type = 'json'
      this.status = 200
      this.body = {
        redirectTo: url,
      }
    },
  }
}


