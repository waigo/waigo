

const waigo = global.waigo,
  TextField = waigo.load('support/forms/fields/text'),
  viewObjects = waigo.load('support/viewObjects');
  

class HiddenField extends TextField {}



/**
 * @override
 */
HiddenField.prototype[viewObjects.METHOD_NAME] = function*(ctx) {
  const ret = yield TextField.prototype[viewObjects.METHOD_NAME].call(this, ctx);

  ret.type = 'hidden';

  return ret;
};


module.exports = HiddenField;
