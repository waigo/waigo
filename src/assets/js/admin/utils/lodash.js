exports.pluck = function(arr, key) {
  return arr.map(function(v) {
    return v[key];
  });
};