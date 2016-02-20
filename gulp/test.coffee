gulp = require 'gulp'
mocha = require 'gulp-mocha'
path = require 'path'

module.exports = (paths, options = {}) ->
  handler: ->
    return gulp.src(
      [
        path.join(paths.test, 'unit', '*.test.js')
      ], { 
        read: false 
      }
    )
      .pipe mocha(
        reporter: 'spec'
        ui: 'exports'  
      )
      # .once 'error', (-> 
      #   process.exit(1);
      # )
      # .once 'end', ( ->
      #   process.exit();
      # )
