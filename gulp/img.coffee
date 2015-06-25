gulp = require 'gulp'

module.exports = (paths, options = {}) ->
  return ->
    gulp.src [
      paths.frontend.src.img_srcFiles,
      "#{paths.root}/node_modules/jsoneditor/dist/img/*"
    ]
      .pipe gulp.dest(paths.frontend.build.img)

