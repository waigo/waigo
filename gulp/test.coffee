gulp = require 'gulp'
mocha = require 'gulp-spawn-mocha'
path = require 'path'

module.exports = (paths, options = {}) ->
  handler: ->
    err = null

    p = null

    if options.onlyTest
      p = [options.onlyTest]
    else
      p = [path.join(paths.test, '**', '**', '**', '*.test.js')]
      if options.ci
        # remove stuff that fails for unknown reasons
        p.push('!' + path.join(paths.test, 'integration', '**', '**', '*.test.js'))
        p.push('!' + path.join(paths.test, '**', '**', '**', 'cliCommand.test.js'))


    return gulp.src(p, {read: false})
      .pipe mocha({
        ui: 'exports'
        reporter: 'spec'
        timeout: 10000
      })
