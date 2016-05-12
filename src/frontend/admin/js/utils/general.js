exports.isValidJSON = function(code) {
  try {
    if (typeof code === 'string') {
      code = JSON.parse(code);
    }      

    if (!exports.isPlainObject(code)) {
      throw new Error('Not a plain object');
    }

    return true;
  } catch (err) {
    return false;
  }
};


exports.isPlainObject = function(o) {
  return Object(o) === o && Object.getPrototypeOf(o) === Object.prototype;
};
