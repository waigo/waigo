gulp = require 'gulp'
gutil = require 'gulp-util'
nodemon = require 'gulp-nodemon'
livereload = require 'gulp-server-livereload'

module.exports = (paths, options = {}) ->
  handler: ->
    gulp.src paths.frontend.build
      .pipe livereload({
        host: '0.0.0.0'
        port: 53234
        livereload:
          enable: true
          host: '0.0.0.0'
          port: 53235
        directoryListing: false
        open: false
      })

    nodemon({ 
      script: 'start-app.js'
      ext: 'js'
      ignore: [
        'docs/*'
        'bin/*'
        'public/*'
        'node_modules/*'
        'test/*'
        'src/cli/*'
        'src/frontend/*'
      ]
    })

