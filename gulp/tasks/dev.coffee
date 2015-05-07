gulp = require 'gulp'
nodemon = require 'gulp-nodemon'


module.exports = (paths, options = {}) ->
  return {
    deps: ['assets', 'dev-assets', 'dev-server']
  }

