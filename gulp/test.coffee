gulp = require 'gulp'
mocha = require 'gulp-mocha'
path = require 'path'

module.exports = (paths, options = {}) ->
  handler: ->
    err = null

    p = null

    if options.onlyTest
      p = options.onlyTest
    else if options.ci
      p = path.join(paths.test, 'unit', '**', '**', '*.test.js')
    else 
      p = path.join(paths.test, '**', '**', '**', '*.test.js')

    return gulp.src([p], { 
        read: false 
      }
    )
      .pipe mocha({
        ui: 'exports'
        reporter: 'spec'
        timeout: 10000
      })
