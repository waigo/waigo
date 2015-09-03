path = require 'path'
buildStylus = require './utils/build-stylus'


module.exports = (paths, options = {}) ->
  handler: ->
    buildStylus
      srcGlob: path.join(paths.frontend.src, 'admin', 'stylus', 'app.styl')
      watchGlob: path.join(paths.frontend.src, 'admin', 'stylus', '**', '**', '*.styl')
      outputName: 'admin.css'
      outputDir: path.join(paths.frontend.build, 'admin')
      options: options
