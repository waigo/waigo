path = require 'path'
buildReactJs = require './utils/build-react-js'


module.exports = (paths, options = {}) ->
  handler: ->
    buildReactJs
      srcGlob: path.join(paths.frontend.src, 'js', 'app.js')
      outputName: 'app.js'
      outputDir: path.join(paths.frontend.build, 'js')
      paths: paths
      options: options
