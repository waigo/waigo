gulp = require 'gulp'

module.exports = (paths, options = {}) ->
  return ->
    gulp.src [
      paths.frontend.src.img.files,
    ]
      .pipe gulp.dest(paths.frontend.build.img.folder)

