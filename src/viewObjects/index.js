const waigo = global.waigo,
  _ = waigo._,
  Q = waigo.load('promise')



/**
 * The name of the method which when called will return a view object representation of the callee.
 * @type {String}
 */
const METHOD_NAME = exports.METHOD_NAME = 'toViewObject'



/**
 * Get yieldable for converting given object into a view object.
 *
 * @param {Object} ctx A request context.
 * @param  {*} inputObject The object.
 * @return A yieldable value.
 */
const toViewObjectYieldable = exports.toViewObjectYieldable = function (inputObject, ctx) {
  if (inputObject) {
    // if it's one of our model schema types
    // (see https://github.com/hiddentao/simple-nosql-schema)
    switch (inputObject) {
      case String:
        return Q.resolve('String')
      case Boolean:
        return Q.resolve('Boolean')
      case Number:
        return Q.resolve('Number')
      case Date:
        return Q.resolve('Date')
      case Object:
        return Q.resolve('Object')
      case Array:
        return Q.resolve('Array')
    }

    // has view object method
    if ('function' === typeof inputObject[METHOD_NAME]) {
      return inputObject[METHOD_NAME](inputObject, ctx)
    }
    // is an array
    else if (_.isArray(inputObject)) {
      // recursive call on all children
      return inputObject.map(function (local) {
        return toViewObjectYieldable(local, ctx)
      })
    }
    // is an object
    else if (_.isPlainObject(inputObject)) {
      const yieldables = {}

      for (const idx in inputObject) {
        yieldables[idx] = toViewObjectYieldable(inputObject[idx], ctx)
      }

      return yieldables
    }
  }

  return Q.resolve(inputObject)
}
