gulp = require 'gulp'
gulpIf = require 'gulp-if'
concat = require 'gulp-concat'
uglify = require 'gulp-uglify'


module.exports = (params) ->
  { src, outputName, outputDir, options } = params

  gulp.src src
    .pipe concat(outputName)
    .pipe gulpIf(options.minifiedBuild, uglify())
    .pipe gulp.dest(outputDir)

