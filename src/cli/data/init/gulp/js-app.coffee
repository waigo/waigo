gulp = require 'gulp'
gulpIf = require 'gulp-if'
path = require 'path'
concat = require 'gulp-concat'
uglify = require 'gulp-uglify'


module.exports = (paths, options = {}) ->
  return ->
    v1 = gulp.src [
      # Example: path.join(paths.frontend.src.js.folder, 'app.js')
    ]
      .pipe concat('app.js')
      .pipe gulpIf(!options.debugBuild, uglify())
      .pipe gulp.dest(paths.frontend.build.js.folder)

