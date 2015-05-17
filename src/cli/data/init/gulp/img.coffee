gulp = require 'gulp'

module.exports = (paths, options = {}) ->
  return ->
    gulp.src [
      paths.assets.src.img.files,
    ]
      .pipe gulp.dest(paths.assets.build.img.folder)

