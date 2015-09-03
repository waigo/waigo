path = require 'path'
concatJs = require './utils/concat-js'


module.exports = (paths, options = {}) ->
  handler: ->
    concatJs
      src: [
        path.join(paths.frontend.lib, 'jquery.js')
        path.join(paths.frontend.lib, 'materialize', 'js', 'materialize.js')
      ]
      outputName: 'admin-vendor.js'
      outputDir: path.join(paths.frontend.build, 'admin')
      options: options
