module.exports = (options, paths = {}, tasks) ->
  deps = ['frontend-css', 'frontend-img', 'frontend-js']

  return {
    deps: deps
  }
