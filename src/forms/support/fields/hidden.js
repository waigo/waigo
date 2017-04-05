const waigo = global.waigo,
  TextField = waigo.load('forms/support/fields/text'),
  viewObjects = waigo.load('viewObjects')


class HiddenField extends TextField {}



/**
 * @override
 */
HiddenField.prototype[viewObjects.METHOD_NAME] = function *(ctx) {
  const ret = yield TextField.prototype[viewObjects.METHOD_NAME].call(this, ctx)

  ret.type = 'hidden'

  return ret
}


module.exports = HiddenField
