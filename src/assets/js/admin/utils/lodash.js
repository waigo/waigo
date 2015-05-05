exports.pluck = function(arr, key) {
  return arr.map(function(v) {
    return v[key];
  });
};


exports.find = function(arr, fn) {
  for (var i=0; arr.length>i; ++i) {
    if (fn(arr[i])) {
      return arr[i];
    }
  }

  return null;
};