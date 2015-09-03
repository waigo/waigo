gulp = require 'gulp'
gulpIf = require 'gulp-if'
concat = require 'gulp-concat'
uglify = require 'gulp-uglify'
gutil = require 'gulp-util'


module.exports = (params) ->
  { src, globWatch, outputName, outputDir, options } = params

  _process = ->
    gutil.log 'Concatenating JS...'

    gulp.src src
      .pipe concat(outputName)
      .pipe gulpIf(options.minifiedBuild, uglify())
      .pipe gulp.dest(outputDir)

  _process()

  if options.watchForChanges and globWatch
    gulp.watch watchGlob, _process

