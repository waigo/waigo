gulp = require 'gulp'
runSequence = require 'run-sequence'

module.exports = (paths, options = {}) ->
  handler: (cb) ->
    options.dontExitOnError = true
    options.watchForChanges = true

    runSequence 'frontend', cb
