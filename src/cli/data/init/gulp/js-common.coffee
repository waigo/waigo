gulp = require 'gulp'
gulpIf = require 'gulp-if'
path = require 'path'
concat = require 'gulp-concat'
uglify = require 'gulp-uglify'


module.exports = (paths, options = {}) ->
  return ->
    v1 = gulp.src [
      # Example: path.join(paths.assets.lib.folder, 'jquery-2.1.3.js')
    ]
      .pipe concat('common.js')
      .pipe gulpIf(!options.debugBuild, uglify())
      .pipe gulp.dest(paths.assets.build.js.folder)

