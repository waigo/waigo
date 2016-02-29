path = require 'path'
buildBrowserifyJs = require './utils/build-browserify-js'


module.exports = (paths, options = {}) ->
  handler: ->
    buildBrowserifyJs
      srcGlob: path.join(paths.frontend.src, 'admin', 'js', 'app.js')
      outputName: 'admin.js'
      outputDir: path.join(paths.frontend.build, 'admin')
      paths: paths
      options: options
