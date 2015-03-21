var React = require('react');

module.exports = {
  buildError: function(err) {
    if (err) {
      return <div className="alert alert-danger">err</div>
    } else {
      return '';
    }
  }
};