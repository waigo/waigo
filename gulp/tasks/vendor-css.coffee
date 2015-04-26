gulp = require 'gulp'
path = require 'path'

module.exports = (paths, options = {}) ->
  return ->
    gulp.src [
      path.join(paths.assets.lib._root, 'materialize', 'css', 'materialize.css') 
      path.join(paths.assets.lib._root, 'prism', 'prism.css') 
    ]
      .pipe gulp.dest(paths.assets.build.css)

