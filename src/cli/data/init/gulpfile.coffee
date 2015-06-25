path = require('path')

fs = require 'fs'
gulp = require('gulp')
gutil = require 'gulp-util'
args = require('yargs').argv


options = 
  debugBuild: if args.debug then true else false
  dontExitOnError: false

if options.debugBuild
  console.log 'DEBUG mode'
 

# paths

paths =
  npm: path.join(__dirname, 'node_modules')
  root: __dirname
  frontend: 
    src: 
      folder: path.join(__dirname, 'src', 'frontend')
      js:
        folder: path.join(__dirname, 'src', 'frontend', 'js')
        files: path.join(__dirname, 'src', 'frontend', 'js', '*.js')
        watch: path.join(__dirname, 'src', 'frontend', 'js', '*.js')
      fonts:
        folder: path.join(__dirname, 'src', 'frontend', 'font')
      stylus:
        folder: path.join(__dirname, 'src', 'frontend', 'stylus')
        files: path.join(__dirname, 'src', 'frontend', 'stylus', 'style.styl')
        watch: path.join(__dirname, 'src', 'frontend', 'stylus', '*.styl')        
      img:
        folder: path.join(__dirname, 'src', 'frontend', 'img')
        files: path.join(__dirname, 'src', 'frontend', 'img', '*.*')
        watch: path.join(__dirname, 'src', 'frontend', 'img', '*.*')
    build: 
      folder: path.join(__dirname, 'public') 
      js:
        folder: path.join(__dirname, 'public', 'js') 
      fonts:
        folder: path.join(__dirname, 'public', 'fonts') 
      img:
        folder: path.join(__dirname, 'public', 'img') 
      css:
        folder: path.join(__dirname, 'public', 'css') 
    lib: 
      folder: path.join(__dirname, 'public', 'lib')


#
# initialisation
# 

# load all gulp tasks
tasksFolder = path.join(__dirname, 'gulp')
taskFiles = fs.readdirSync tasksFolder

for tf in taskFiles
  if '.coffee' isnt path.extname(tf)
    continue

  fn = require(path.join(tasksFolder, tf))
  taskInfo = fn(paths, options)

  handler = undefined
  deps = []

  if taskInfo.deps
    deps = taskInfo.deps
    handler = taskInfo.task
  else
    handler = taskInfo

  gulp.task path.basename(tf, '.coffee'), deps, handler


# default task
gulp.task 'default', ['dev']


