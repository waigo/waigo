"use strict";

const waigo = global.waigo,
  TextField = waigo.load('support/forms/fields/text'),
  viewObjects = waigo.load('support/viewObjects');
  

class HiddenField extends TextField {}


module.exports = HiddenField;
