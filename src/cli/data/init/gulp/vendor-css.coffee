gulp = require 'gulp'
path = require 'path'

module.exports = (paths, options = {}) ->
  return ->
    gulp.src [
      # Example: path.join(paths.assets.lib.folder, 'somelib', 'somelib.css') 
    ]
      .pipe gulp.dest(paths.assets.build.css.folder)

