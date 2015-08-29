gulp = require 'gulp'
path = require 'path'

module.exports = (paths, options = {}) ->
  return ->
    gulp.src [
      # path.join(paths.frontend.lib._root, 'materialize', 'css', 'materialize.css') 
    ]
      .pipe gulp.dest(paths.frontend.build.css)

