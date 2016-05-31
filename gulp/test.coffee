gulp = require 'gulp'
exec = require 'gulp-exec'
path = require 'path'

module.exports = (paths, options = {}) ->
  handler: ->
    err = null

    return gulp.src(
      [
        options.onlyTest || path.join(paths.test, 'unit', '**', '**', '**', '*.test.js')
      ], { 
        read: false 
      }
    )
      .pipe exec(
        'node_modules/.bin/mocha --colors --ui exports --timeout 10000 --reporter spec <%= file.path %>'
      )
      .once 'error', (e) -> 
        err = e
      .pipe exec.reporter({
        err: false
        stderr: true
        stdout: true
      })
      .once 'end', -> 
        if err then this.emit('error', err)
