gulp = require 'gulp'

module.exports = (paths, options = {}) ->
  return ->
    gulp.src [
      paths.assets.src.img_srcFiles,
      "#{paths.root}/node_modules/jsoneditor/dist/img/*"
    ]
      .pipe gulp.dest(paths.assets.build.img)

