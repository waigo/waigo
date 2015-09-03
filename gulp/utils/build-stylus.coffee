gulp = require 'gulp'
gutil = require 'gulp-util'
gulpIf = require 'gulp-if'
path = require 'path'
prefix = require('gulp-autoprefixer')
minifyCss = require('gulp-minify-css')
concat = require('gulp-concat')
stylus = require('gulp-stylus')
nib = require('nib')
rupture = require('rupture')


module.exports = (params) ->
  { srcGlob, watchGlob, outputName, outputDir, options } = params

  _process = ->
    gutil.log 'Building CSS...'

    stylusCompiler = stylus({
      use: [ nib(), rupture() ]
    })

    p = gulp.src srcGlob
      .pipe stylusCompiler

    if options.dontExitOnError
      p = p.on 'error', (err) ->
        gutil.log err.stack
        stylusCompiler.end()
      
    p
      .pipe prefix()
      .pipe concat(outputName)
      .pipe gulpIf(options.minifiedBuild, minifyCss())
      .pipe gulp.dest(outputDir)


  if options.watchForChanges and watchGlob
    gulp.watch watchGlob, _process

  _process()

