gulp = require 'gulp'
gutil = require 'gulp-util'

module.exports = (params) ->
  { src, watchGlob, outputDir, options } = params

  _process = ->
    gutil.log 'Copying files...'
    gulp.src src
      .pipe gulp.dest outputDir

  _process()

  if options.watchForChanges and watchGlob
    gulp.watch watchGlob, _process
