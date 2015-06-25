gulp = require 'gulp'
nodemon = require 'gulp-nodemon'


module.exports = (paths, options = {}) ->
  return {
    deps: ['frontend']
    task: ->
      options.dontExitOnError = true
      gulp.watch paths.frontend.src.img.watch, ['img']
      gulp.watch paths.frontend.src.stylus.watch, ['stylus']
      gulp.watch paths.frontend.src.js.watch, ['js']
  }

