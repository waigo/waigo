gulp = require 'gulp'
path = require 'path'

module.exports = (paths, options = {}) ->
  return ->
    gulp.src [
      # Example: '#{paths.root}/node_modules/font-awesome-stylus/fonts/*.*'
      # Example: path.join(paths.assets.lib.folder, 'materialize', 'font', '**')
    ]
      .pipe gulp.dest(paths.assets.build.fonts.folder)

