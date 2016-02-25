var React = require('react');
var Router = require('react-router');


module.exports = React.createClass({
  propTypes: {
    item: React.PropTypes.object,
  },

  getDefaultProps: function() {
    return {
      item: null,
    };
  },

  render: function() {
    var item = this.props.item;
    
    var status = 'status ' + (item.disabled ? 'inactive' : 'active');

    return (
      <span className="item-label">
        <span className={status}>{item.id}</span>
      </span>
    );
  },
});

