gulp = require 'gulp'
gulpIf = require 'gulp-if'
path = require 'path'
es = require 'event-stream'
concat = require 'gulp-concat'
uglify = require 'gulp-uglify'


module.exports = (paths, options = {}) ->
  return ->
    v1 = gulp.src [
      '#{paths.root}/node_modules/lodash/lodash.js'
      '#{paths.root}/node_modules/moment/moment.js'
      path.join(paths.assets.lib._root, 'jquery-2.1.3.min.js')
      path.join(paths.assets.lib._root, 'materialize', 'js', 'materialize.js')
      path.join(paths.assets.lib._root, 'prism', 'prism.js')
    ]
      .pipe concat('common.js')
      .pipe gulpIf(!options.debugBuild, uglify())
      .pipe gulp.dest(paths.assets.build.js)

    v2 = gulp.src [
      path.join(paths.assets.lib._root, 'ace', 'ace.js')
      path.join(paths.assets.lib._root, 'ace', 'mode-json.js')
      path.join(paths.assets.lib._root, 'ace', 'theme-clouds.js')
    ]
      .pipe concat('ace.js')
      .pipe gulpIf(!options.debugBuild, uglify())
      .pipe gulp.dest(paths.assets.build.js)

    es.merge v1, v2


