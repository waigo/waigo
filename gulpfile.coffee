path = require('path')

gulp = require('gulp')
nodemon = require('gulp-nodemon')
prefix = require('gulp-autoprefixer')
minifyCss = require('gulp-minify-css')
concat = require('gulp-concat')
stylus = require('gulp-stylus')
nib = require('nib')
rupture = require('rupture')


reportError = (err) ->
  gutil.log err


folders = {}
folders.src = path.join(__dirname, 'src') 
folders.static = 
  src:
    root: path.join(folders.src, 'public', 'src')
  build:
    root: path.join(folders.src, 'public', 'build')

folders.static.src.stylus = path.join(folders.static.src.root, 'stylus')
folders.static.build.css = path.join(folders.static.build.root, 'css')

folders.static.src.img = path.join(folders.static.src.root, 'img')
folders.static.build.img = path.join(folders.static.build.root, 'img')

files =
  src:
    img: path.join(folders.static.src.img, '**', '*.*')
    stylus: path.join(folders.static.src.stylus, '**', '*.styl')


gulp.task 'css', ->
  gulp.src files.src.stylus
    .pipe stylus({
      use: [ nib(), rupture() ]
    })
    .pipe prefix()
    .pipe concat('style.css')
    .pipe minifyCss()
    .pipe gulp.dest(folders.static.build.css)


gulp.task 'img', ->
  gulp.src files.src.img
    .pipe gulp.dest(folders.static.build.img)


gulp.task 'static', ['css', 'img']


gulp.task 'dev', ['static'], ->
  nodemon({ 
    script: 'start-app.js'
    ext: 'jade js styl'
    ignore: [
      'docs/*'
      'bin/*'
      'node_modules/*'
      'test/*'
      'src/cli/*'
    ]
  })
    .on('change', ['static'])



