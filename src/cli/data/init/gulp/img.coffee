gulp = require 'gulp'

module.exports = (paths, options = {}) ->
  return ->
    gulp.src [
      paths.frontend.src.img_srcFiles,
    ]
      .pipe gulp.dest(paths.frontend.build.img)

