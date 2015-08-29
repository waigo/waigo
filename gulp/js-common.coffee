gulp = require 'gulp'
gulpIf = require 'gulp-if'
path = require 'path'
es = require 'event-stream'
concat = require 'gulp-concat'
uglify = require 'gulp-uglify'


module.exports = (paths, options = {}) ->
  return ->
    v1 = gulp.src [
      path.join(paths.frontend.lib._root, 'jquery-2.1.3.js')
      path.join(paths.frontend.lib._root, 'materialize', 'js', 'materialize.js')
    ]
      .pipe concat('common.js')
      .pipe gulpIf(!options.debugBuild, uglify())
      .pipe gulp.dest(paths.frontend.build.js)

