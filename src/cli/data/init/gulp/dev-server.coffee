gulp = require 'gulp'
nodemon = require 'gulp-nodemon'


module.exports = (paths, options = {}) ->
  return ->
    nodemon({ 
      script: 'start-app.js'
      ext: 'js'
      ignore: [
        'public/*'
        'node_modules/*'
        'src/cli/*'
        'src/frontend/*'
      ]
    })

