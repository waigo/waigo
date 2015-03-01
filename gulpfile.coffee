path = require('path')

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
 

webpackOptions =
  debug: debugBuild
  devtool: '#source-map'
  watchDelay: 200

webpackConfig =
  useMemoryFs: true
  # progress: true


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


folders.assets.src.js = path.join(folders.assets.src.root, 'js')
folders.assets.build.js = path.join(folders.assets.build.root, 'js')

files =
  src:
    img: path.join(folders.assets.src.img, '**', '*.*')
    stylus: path.join(folders.assets.src.stylus, '**', '*.styl')
    js: path.join(folders.assets.src.js, '**', '*.js')
files.watch =
  img: files.src.img
  stylus: files.src.stylus
  js: files.src.js



gulp.task 'js', ->
  gulp.src(path.join(__dirname, webpack.config.CONFIG_FILENAME))
    .pipe webpack.configure(webpackConfig)
    .pipe webpack.overrides(webpackOptions)
    .pipe webpack.compile()
    .pipe webpack.format({
        version: false,
        timings: true
    })
    .pipe webpack.failAfter({
        errors: true,
        warnings: true
    })
    .pipe gulpIf(!debugBuild, uglify())
    .pipe gulp.dest(folders.assets.build.js)


gulp.task 'css', ->
  gulp.src files.src.stylus
    .pipe stylus({
      use: [ nib(), rupture() ]
    })
    .pipe prefix()
    .pipe concat('style.css')
    .pipe gulpIf(!debugBuild, minifyCss())
    .pipe gulp.dest(folders.assets.build.css)


gulp.task 'img', ->
  gulp.src files.src.img
    .pipe gulp.dest(folders.assets.build.img)


gulp.task 'assets', ['css', 'img', 'js']

gulp.task 'dev', ['assets'], ->
  gulp.watch files.watch.img, ['img']
  gulp.watch files.watch.stylus, ['css']
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



