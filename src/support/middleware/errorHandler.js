


const waigo = global.waigo,
  _ = waigo._,
  errors = waigo.load('support/errors'),
  viewObjects = waigo.load('support/viewObjects')



/**
 * Build error handler middleware.
 *
 * This will catch any errors thrown from downstream middleware or controller 
 * handler functions.
 * 
 * @return {Function} middleware
 */
module.exports = function() {
  return function*(next) {
    // convenient throw method
    this.throw = _throw

    try {
      yield next
    } catch (err) {
      this.App.emit('error', err.stack)

      // render error page
      yield render.call(this, {
        showStack: !!_.get(this.App, 'config.errors.showStack'),
      }, err)
    }
  }
}





/**
 * Render given error back to client.
 * @param config {Object} error handler config.
 * @param err {Error} the error
 * @return {*}
 * @private
 */
const render = function*(config, err) {
  this.status = err.status || 500

  const error = yield viewObjects.toViewObjectYieldable(err, this)

  error.status = this.status
  error.request = {
    method: this.request.method,
    url: this.request.url,
  }

  if (config.showStack) {
    error.stack = err.stack.split("\n")
  }

  try {
    yield this.render('error', error)
  } catch (anotherError) {
    this.App.emit('error', anotherError.stack)

    this.type = 'json'
    this.body = anotherError
  }
}





/**
 * Throw an error
 * @param  {Class} [errorClass] Error class. Default is `RuntimeError`.
 * @param  {Any} ...       Additional arguments get passed to error class constructor.
 * @throws Error
 */
const _throw = function() {
  const args = Array.prototype.slice.call(arguments),
    ErrorClass = args[0]

  if (_.isObject(ErrorClass)) {
    args.shift()
  } else {
    ErrorClass = errors.RuntimeError
  }

  args.unshift(null)   // the this arg for the .bind() call

  throw new (Function.prototype.bind.apply(ErrorClass, args))
}


