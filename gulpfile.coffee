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

files =
  src:
    stylus: path.join(folders.static.src.stylus, '**', '*.styl')


gulp.task 'css', ->
  gulp.src files.src.stylus
    .pipe stylus({
      use: [ nib(), rupture() ],
      compress: true
    })
    .pipe prefix()
    .pipe concat('style.css')
    .pipe minifyCss()
    .pipe gulp.dest(folders.static.build.css)


gulp.task 'dev', ->
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
    .on('change', ['css'])
    .on('restart', ->
      console.log('App restarted!')
    )



