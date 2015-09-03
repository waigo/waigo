path = require 'path'
copyFiles = require './utils/copy-files'

module.exports = (paths, options = {}) ->
  handler: ->
    copyFiles
      src: [
        path.join(paths.npm, 'font-awesome-stylus', 'fonts', '*.*')
        path.join(paths.frontend.lib, 'materialize', 'font', '**')
      ]
      outputDir: path.join(paths.frontend.build, 'font')
      options: options

