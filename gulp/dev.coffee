runSequence = require 'run-sequence'

module.exports = (paths, options = {}) ->
  handler: (cb) ->
    runSequence 'dev-frontend', 'dev-server', cb

