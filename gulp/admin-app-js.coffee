path = require 'path'
buildReactJs = require './utils/build-react-js'


module.exports = (paths, options = {}) ->
  handler: ->
    buildReactJs
      srcGlob: path.join(paths.frontend.src, 'admin', 'js', 'app.js')
      outputName: 'admin.js'
      outputDir: path.join(paths.frontend.build, 'admin')
      paths: paths
      options: options
