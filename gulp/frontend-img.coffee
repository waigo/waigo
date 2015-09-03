path = require 'path'
copyFiles = require './utils/copy-files'

module.exports = (paths, options = {}) ->
  handler: ->
    copyFiles
      src: [
        path.join(paths.frontend.src, 'img', '*.*')
      ]
      watchGlob: path.join(paths.frontend.src, 'img', '*.*')
      outputDir: path.join(paths.frontend.build, 'img')
      options: options
