var React = require('react');

var Button = require('./button');


module.exports = React.createClass({
  render: function() {
    return (
      <Button type="submit" {...this.props} />
    );
  }
});