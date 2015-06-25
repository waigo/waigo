var React = require('react');
var Router = require('react-router');



module.exports = React.createClass({
  propTypes: {
    items : React.PropTypes.array,
  },

  getDefaultProps: function() {
    return {
      items : [],
    };
  },

  render: function() {
    var self = this;

    var items = this.props.items.map(function(item) {
      return (
        <li className="collection-item" key={item.key}>
          {self._renderItem(item)}
        </li>
      );
    });

    return (
      <ul className="collection">{items}</ul>
    );
  },


  _renderItem: function(item) {
    if (this.props.renderItem) {
      return this.props.renderItem(item);
    } else {
      return item.value;
    }
  },

});

