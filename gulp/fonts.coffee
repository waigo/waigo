gulp = require 'gulp'
path = require 'path'

module.exports = (paths, options = {}) ->
  return ->
    gulp.src [
      '#{paths.root}/node_modules/font-awesome-stylus/fonts/*.*'
      path.join(paths.frontend.lib._root, 'materialize', 'font', '**')
    ]
      .pipe gulp.dest(paths.frontend.build.fonts)

