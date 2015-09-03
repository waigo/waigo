path = require 'path'
buildJs = require './utils/build-js'


module.exports = (paths, options = {}) ->
  handler: ->
    buildJs
      srcGlob: path.join(paths.frontend.src, 'js', 'app.js')
      outputName: 'app.js'
      outputDir: path.join(paths.frontend.build, 'js')
      paths: paths
      options: options
