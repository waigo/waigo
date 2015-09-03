browserify = require 'browserify'

concat = require 'gulp-concat'
source = require 'vinyl-source-stream2'
uglify = require 'gulp-uglify'
watchify = require 'watchify'

gulp = require 'gulp'
gutil = require 'gulp-util'
gulpIf = require 'gulp-if'



module.exports = (params) ->
  { paths, options, srcGlob, outputName, outputDir} = params

  _process = (b) ->
    bundle = b.bundle()

    if options.dontExitOnError
      bundle = bundle.on 'error', (err) ->
        gutil.log(err.stack)

    bundle
      .pipe source(outputName)
      .pipe gulpIf(options.minifiedBuild, uglify())
      .pipe gulp.dest(outputDir)

  b = browserify(
    entries: srcGlob
    debug: !options.minifiedBuild
    cache: {}
    packageCache: {}
  )

  # From http://christianalfoni.github.io/javascript/2014/08/15/react-js-workflow.html
  if options.watchForChanges
    b = watchify(b)
      .on 'update', ->
        gutil.log 'Rerunning browserify...'
        updateStart = Date.now()
        _process(b)
        gutil.log '...Done (' + (Date.now() - updateStart) + 'ms)'

  # kick-off
  _process(b)



