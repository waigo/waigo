path = require 'path'
concatJs = require './utils/concat-js'


module.exports = (paths, options = {}) ->
  handler: ->
    concatJs
      src: path.join(paths.frontend.src, 'js', 'app.js')
      watchGlob: path.join(paths.frontend.src, 'js', '**', '**', '*.js')
      outputName: 'app.js'
      outputDir: path.join(paths.frontend.build, 'js')
      options: options
