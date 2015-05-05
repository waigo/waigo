var React = require('react');


module.exports = React.createClass({
  propTypes: {
    label: React.PropTypes.string,
  },

  getInitialState: function() {
    return {
      initialised: false
    };
  },

  getDefaultProps: function() {
    return {
      label: '',
    };
  },

  render: function() {
    return (
      <ul className="collapsible" ref="collapsible">
        <li>
          <div className="collapsible-header">
            <i className="fa fa-gear"></i>
            <span>{this.props.label}</span>
          </div>
          <div className="collapsible-body">
            {this.props.children}
          </div>
        </li>
      </ul>
    );
  },

  componentDidUpdate: function() {
    if (!this.state.initialised) {
      $(React.findDOMNode(this.refs.collapsible)).collapsible();

      this.setState({
        initialised: true
      });
    }
  },

});

