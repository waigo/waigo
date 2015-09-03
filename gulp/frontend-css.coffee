path = require 'path'
buildStylus = require './utils/build-stylus'

module.exports = (paths, options = {}) ->
  handler: ->
    buildStylus
      srcGlob: path.join(paths.frontend.src, 'stylus', 'app.styl')
      watchGlob: path.join(paths.frontend.src, 'stylus', '**', '**', '*.styl')
      outputName: 'app.css'
      outputDir: path.join(paths.frontend.build, 'css')
      options: options
