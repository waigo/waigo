path = require 'path'
buildJs = require './utils/build-js'


module.exports = (paths, options = {}) ->
  handler: ->
    buildJs
      srcGlob: path.join(paths.frontend.src, 'admin', 'js', 'app.js')
      outputName: 'admin.js'
      outputDir: path.join(paths.frontend.build, 'admin')
      paths: paths
      options: options
