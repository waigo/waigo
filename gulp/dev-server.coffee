gulp = require 'gulp'
nodemon = require 'gulp-nodemon'


module.exports = (paths, options = {}) ->
  return ->
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

