gulp = require 'gulp'
gulpIf = require 'gulp-if'
concat = require 'gulp-concat'
minifyCss = require 'gulp-minify-css'


module.exports = (params) ->
  { src, outputName, outputDir, options } = params

  gulp.src src
    .pipe concat(outputName)
    .pipe gulpIf(options.minifiedBuild, minifyCss())
    .pipe gulp.dest(outputDir)

