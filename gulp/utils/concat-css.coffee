gulp = require 'gulp'
gulpIf = require 'gulp-if'
concat = require 'gulp-concat'
minifyCss = require 'gulp-minify-css'
gutil = require 'gulp-util'


module.exports = (params) ->
  { src, globWatch, outputName, outputDir, options } = params

  _process = ->
    gutil.log 'Concatenating CSS...'

    gulp.src src
      .pipe concat(outputName)
      .pipe gulpIf(options.minifiedBuild, minifyCss())
      .pipe gulp.dest(outputDir)

  _process()

  if options.watchForChanges and globWatch
    gulp.watch watchGlob, _process
