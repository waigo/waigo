gulp = require 'gulp'
gutil = require 'gulp-util'
nodemon = require 'gulp-nodemon'


module.exports = (paths, options = {}) ->
  handler: ->
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

