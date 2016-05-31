gulp = require 'gulp'
mocha = require 'gulp-mocha'
path = require 'path'

module.exports = (paths, options = {}) ->
  handler: ->
    err = null

    return gulp.src(
      [
        options.onlyTest || path.join(paths.test, '**', '**', '**', '*.test.js')
      ], { 
        read: false 
      }
    )
      .pipe mocha({
        ui: 'exports'
        reporter: 'spec'
        timeout: 10000
      })
