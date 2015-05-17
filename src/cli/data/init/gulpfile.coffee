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
  root: __dirname
  assets: 
    src: 
      folder: path.join(__dirname, 'src', 'assets')
      js:
        folder: path.join(__dirname, 'src', 'assets', 'js')
        files: path.join(__dirname, 'src', 'assets', 'js', '*.js')
        watch: path.join(__dirname, 'src', 'assets', 'js', '*.js')
      fonts:
        folder: path.join(__dirname, 'src', 'assets', 'font')
      stylus:
        folder: path.join(__dirname, 'src', 'assets', 'stylus')
        files: path.join(__dirname, 'src', 'assets', 'stylus', 'style.styl')
        watch: path.join(__dirname, 'src', 'assets', 'stylus', '*.styl')        
      img:
        folder: path.join(__dirname, 'src', 'assets', 'img')
        files: path.join(__dirname, 'src', 'assets', 'img', '*.*')
        watch: path.join(__dirname, 'src', 'assets', 'img', '*.*')
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


