gulp = require 'gulp'
path = require 'path'

module.exports = (paths, options = {}) ->
  return ->
    gulp.src [
      # Example: path.join(paths.frontend.lib.folder, 'somelib', 'somelib.css') 
    ]
      .pipe gulp.dest(paths.frontend.build.css.folder)

