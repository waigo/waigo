gulp = require 'gulp'
nodemon = require 'gulp-nodemon'


module.exports = (paths, options = {}) ->
  return {
    deps: ['assets']
    task: ->
      options.dontExitOnError = true
      gulp.watch paths.assets.src.img.watch, ['img']
      gulp.watch paths.assets.src.stylus.watch, ['stylus']
      gulp.watch paths.assets.src.js.watch, ['js']
  }

