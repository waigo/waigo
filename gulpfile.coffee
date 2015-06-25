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
  frontend: 
    src: 
      _root: path.join(__dirname, 'src', 'frontend')
    build: 
      _root: path.join(__dirname, 'public') 
    lib: 
      _root: path.join(__dirname, 'public', 'lib')


# Stylus

paths.frontend.src.stylus = path.join(paths.frontend.src._root, 'stylus')
paths.frontend.build.css = path.join(paths.frontend.build._root, 'css')

paths.frontend.src.stylus_srcFiles = path.join(paths.frontend.src.stylus, '**', '**', '**', '**', 'style.styl')
paths.frontend.src.stylus_watchFiles = path.join(paths.frontend.src.stylus, '**', '*.styl')

# Img 
# 
paths.frontend.src.img = path.join(paths.frontend.src._root, 'img')
paths.frontend.build.img = path.join(paths.frontend.build._root, 'img')

paths.frontend.src.img_srcFiles = path.join(paths.frontend.src.img, '**', '**', '**', '**', '*.*')
paths.frontend.src.img_watchFiles = paths.frontend.src.img_srcFiles

# Fonts
# 
paths.frontend.build.fonts = path.join(paths.frontend.build._root, 'font')

# Js
# 
paths.frontend.src.js = path.join(paths.frontend.src._root, 'js')
paths.frontend.build.js = path.join(paths.frontend.build._root, 'js')

paths.frontend.src.js_srcFiles = path.join(paths.frontend.src.js, '**', '**', '**', '**', '*.js')
paths.frontend.src.js_watchFiles = paths.frontend.src.js_srcFiles



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
