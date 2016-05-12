var React = require('react');

module.exports = React.createClass({
  propTypes: {
    items: React.PropTypes.array,
    initOnUpdate: React.PropTypes.bool,
  },

  getDefaultProps: function() {
    return {
      items: [],
      initOnUpdate: false,
    };
  },

  getInitialState: function() {
    return {
      initialised: false
    };
  },

  render: function() {
    var items = this.props.items.map(function(item) {
      return (
        <li>
          <div className="collapsible-header">
            {item.label}
          </div>
          <div className="collapsible-body">
            {item.body}
          </div>
        </li>
      );
    });

    return (
      <ul className="collapsible" ref="collapsible">{items}</ul>
    );
  },

  componentDidMount: function() {
    if (!this.props.initOnUpdate) {
      this.componentDidUpdate();
    }
  },

  componentDidUpdate: function() {
    if (!this.state.initialised) {
      $(this.refs.collapsible).collapsible();

      this.setState({
        initialised: true
      });
    }
  },

});

