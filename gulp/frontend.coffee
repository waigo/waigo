module.exports = (options, paths = {}, tasks) ->
  deps = ['frontend-css', 'frontend-img', 'frontend-js']

  if tasks['admin']
    deps.push 'admin'

  return {
    deps: deps
  }
