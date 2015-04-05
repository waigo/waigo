path = require('path')

es = require('event-stream')
gulp = require('gulp')
nodemon = require('gulp-nodemon')
prefix = require('gulp-autoprefixer')
minifyCss = require('gulp-minify-css')
concat = require('gulp-concat')
stylus = require('gulp-stylus')
filter = require('gulp-filter')
nib = require('nib')
rupture = require('rupture')
uglify = require('gulp-uglify')
webpack = require('gulp-webpack-build')
gulpIf = require('gulp-if')
args = require('yargs').argv


reportError = (err) ->
  gutil.log err


debugBuild = if args.debug then true else false
if debugBuild
  console.log 'DEBUG mode'
 

webpackOptions =
  debug: debugBuild
  devtool: '#source-map'
  watchDelay: 200

webpackConfig =
  useMemoryFs: true
  # progress: true


dontExitOnError = false


folders = {}
folders.src = path.join(__dirname, 'src') 

folders.public = path.join(__dirname, 'public') 

folders.assets = 
  src:
    root: path.join(folders.src, 'assets')
  build:
    root: folders.public

folders.assets.src.stylus = path.join(folders.assets.src.root, 'stylus')
folders.assets.build.css = path.join(folders.assets.build.root, 'css')

folders.assets.src.img = path.join(folders.assets.src.root, 'img')
folders.assets.build.img = path.join(folders.assets.build.root, 'img')

folders.assets.build.fonts = path.join(folders.assets.build.root, 'font')

folders.assets.src.js = path.join(folders.assets.src.root, 'js')
folders.assets.build.js = path.join(folders.assets.build.root, 'js')

folders.assets.lib = 
  root: path.join(folders.public, 'lib')

folders.assets.lib.materialize = path.join(folders.assets.lib.root, 'materialize', 'dist') 



files =
  src:
    img: path.join(folders.assets.src.img, '**', '**', '**', '**', '*.*')
    stylus: path.join(folders.assets.src.stylus, '**', '**', '**', '**', 'style.styl')
    js: path.join(folders.assets.src.js, '**', '**', '**', '**', '*.js')
files.watch =
  img: files.src.img
  stylus: path.join(folders.assets.src.stylus, '**', '*.styl')
  js: files.src.js



gulp.task 'js-admin', ->
  gulp.src(path.join(__dirname, webpack.config.CONFIG_FILENAME))
    .pipe webpack.configure(webpackConfig)
    .pipe webpack.overrides(webpackOptions)
    .pipe webpack.compile()
    .pipe webpack.format({
        version: false,
        timings: true
    })
    .pipe webpack.failAfter({
        errors: !dontExitOnError,
        warnings: false,
    })
    .pipe gulpIf(!debugBuild, uglify())
    .pipe gulp.dest(folders.assets.build.js)


gulp.task 'js-vendor', ->
  v1 = gulp.src [
    'node_modules/lodash/lodash.js'
    'node_modules/moment/moment.js'
    path.join(folders.assets.lib.root, 'jquery-2.1.3.min.js')
    path.join(folders.assets.lib.materialize, 'js', 'materialize.js')
  ]
    .pipe concat('common.js')
    .pipe gulpIf(!debugBuild, uglify())
    .pipe gulp.dest(folders.assets.build.js)

  v2 = gulp.src [
    path.join(folders.assets.lib.root, 'ace', 'ace.js')
    path.join(folders.assets.lib.root, 'ace', 'mode-json.js')
    path.join(folders.assets.lib.root, 'ace', 'theme-clouds.js')
  ]
    .pipe concat('ace.js')
    .pipe gulpIf(!debugBuild, uglify())
    .pipe gulp.dest(folders.assets.build.js)

  es.merge v1, v2




gulp.task 'js', ['js-admin', 'js-vendor']


gulp.task 'fonts', ->
  gulp.src [
    'node_modules/font-awesome-stylus/fonts/*.*'
    path.join(folders.assets.lib.materialize, 'font', '**')
  ]
    .pipe gulp.dest(folders.assets.build.fonts)


gulp.task 'stylus', ->
  gulp.src files.src.stylus
    .pipe stylus({
      use: [ nib(), rupture() ]
    })
    .pipe prefix()
    .pipe concat('style.css')
    .pipe gulpIf(!debugBuild, minifyCss())
    .pipe gulp.dest(folders.assets.build.css)


gulp.task 'materialize-css', ->
  gulp.src( path.join(folders.assets.lib.materialize, 'css', 'materialize.css') )
    .pipe gulp.dest(folders.assets.build.css)


gulp.task 'css', ['stylus', 'materialize-css']


gulp.task 'img', ->
  gulp.src [
    files.src.img,
    "#{__dirname}/node_modules/jsoneditor/dist/img/*"
  ]
    .pipe gulp.dest(folders.assets.build.img)


gulp.task 'assets', ['css', 'img', 'js', 'fonts']

gulp.task 'dev', ['assets'], ->
  dontExitOnError = true

  gulp.watch files.watch.img, ['img']
  gulp.watch files.watch.stylus, ['stylus']
  gulp.watch files.watch.js, ['js']

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
      'src/assets/*'
    ]
  })


gulp.task 'default', ['dev']

