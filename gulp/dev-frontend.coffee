gulp = require 'gulp'
nodemon = require 'gulp-nodemon'


module.exports = (paths, options = {}) ->
  return {
    deps: ['frontend']
    task: ->
      options.dontExitOnError = true
      gulp.watch paths.frontend.src.img_watchFiles, ['img']
      gulp.watch paths.frontend.src.stylus_watchFiles, ['stylus']
      gulp.watch paths.frontend.src.js_watchFiles, ['js']
  }

