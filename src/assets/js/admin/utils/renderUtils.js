module.exports = {
  buildError: function(err) {
    if (err) {
      return <div className="error">{err.toString()}</div>
    } else {
      return '';
    }
  }
};