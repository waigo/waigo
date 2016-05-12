path = require 'path'
concatCss = require './utils/concat-css'

module.exports = (paths, options = {}) ->
  handler: ->
    concatCss
      src: [
        path.join(paths.frontend.lib, 'materialize', 'css', 'materialize.css') 
        path.join(paths.frontend.lib, 'prism', 'prism.css') 
        path.join(paths.npm, 'codemirror', 'lib', 'codemirror.css')
      ]
      outputName: 'admin-vendor.css'
      outputDir: path.join(paths.frontend.build, 'admin')
      options: options

