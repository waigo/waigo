gulp = require 'gulp'
nodemon = require 'gulp-nodemon'


module.exports = (paths, options = {}) ->
  return {
    deps: ['frontend', 'dev-frontend', 'dev-server']
  }

