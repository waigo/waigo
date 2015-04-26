_ = require 'lodash'
Q = require 'bluebird'
path = require 'path'
recursiveReadDir = require 'readdirrsync'
webpack = require 'gulp-webpack-build'
CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin")

gulp = require 'gulp'
gulpIf = require 'gulp-if'
uglify = require 'gulp-uglify'



buildWebpackConfig = (paths, options = {}) ->
  # create entries array
  adminJsFolder = path.join(paths.assets.src.js, 'admin')
  adminJsFiles = recursiveReadDir(adminJsFolder)

  entries =
    vendor: [
      'prism'
      'react'
      'react-router'
    ]

  _.each adminJsFiles, (f) ->
    if '.js' isnt path.extname(f)
      return

    relPath = f.substr(adminJsFolder.length )
    toks = path.parse relPath

    if 0 is toks.dir.indexOf('/pages')
      if  'app.js' is toks.base
        section = toks.dir.split('/')[2]
        entries[section] = ".#{relPath}"
    else
      entries.vendor.push(".#{relPath}")

  return {
    context: adminJsFolder
    entry: entries
    output:
      filename: 'admin.[name].js'
    module:
      loaders: [{
        test: /\.jsx?$/
        loader: 'jsx-loader!babel-loader?experimental&optional=runtime'
      }]
    plugins: [
      new CommonsChunkPlugin("vendor", "admin.vendor.js")
    ]
    devtool: 'inline-source-map'
    debug: options.debugBuild
    watchDelay: 200
  }


module.exports = (paths, options = {}) ->
  webpackConfig = buildWebpackConfig paths, options

  return -> 
    gulp.src(path.join(paths.root, webpack.config.CONFIG_FILENAME))
      .pipe webpack.configure({
        useMemoryFs: true
        progress: false
      })
      .pipe webpack.overrides(webpackConfig)
      .pipe webpack.compile()
      .pipe webpack.format({
          version: false,
          timings: true
      })
      .pipe webpack.failAfter({
          errors: !options.dontExitOnError,
          warnings: false,
      })
      .pipe gulpIf(!options.debugBuild, uglify())
      .pipe gulp.dest(paths.assets.build.js)


