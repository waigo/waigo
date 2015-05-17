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
      _root: path.join(__dirname, 'src', 'assets')
    build: 
      _root: path.join(__dirname, 'public') 
    lib: 
      _root: path.join(__dirname, 'public', 'lib')


# Stylus

paths.assets.src.stylus = path.join(paths.assets.src._root, 'stylus')
paths.assets.build.css = path.join(paths.assets.build._root, 'css')

paths.assets.src.stylus_srcFiles = path.join(paths.assets.src.stylus, '**', '**', '**', '**', 'style.styl')
paths.assets.src.stylus_watchFiles = path.join(paths.assets.src.stylus, '**', '*.styl')

# Img 
# 
paths.assets.src.img = path.join(paths.assets.src._root, 'img')
paths.assets.build.img = path.join(paths.assets.build._root, 'img')

paths.assets.src.img_srcFiles = path.join(paths.assets.src.img, '**', '**', '**', '**', '*.*')
paths.assets.src.img_watchFiles = paths.assets.src.img_srcFiles

# Fonts
# 
paths.assets.build.fonts = path.join(paths.assets.build._root, 'font')

# Js
# 
paths.assets.src.js = path.join(paths.assets.src._root, 'js')
paths.assets.build.js = path.join(paths.assets.build._root, 'js')

paths.assets.src.js_srcFiles = path.join(paths.assets.src.js, '**', '**', '**', '**', '*.js')
paths.assets.src.js_watchFiles = paths.assets.src.js_srcFiles



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
