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


module.exports = (paths, options = {}) ->
  return ->
    stylusCompiler = stylus({
      use: [ nib(), rupture() ]
    })

    gulp.src paths.frontend.src.stylus.files
      .pipe stylusCompiler
      .on 'error', (err) ->
        gutil.log err.stack
        stylusCompiler.end()
      .pipe prefix()
      .pipe concat('app.css')
      .pipe gulpIf(!options.debugBuild, minifyCss())
      .pipe gulp.dest(paths.frontend.build.css.folder)

