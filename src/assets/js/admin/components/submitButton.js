var React = require('react');


module.exports = React.createClass({
  propTypes: {
    label : React.PropTypes.string,
    disabled : React.PropTypes.boolean,
  },

  getDefaultProps: function() {
    return {
      label: 'Submit',
      disabled: false,
    };
  },

  render: function() {
    var classes = 'btn btn-primary waves-effect waves-light';

    if (this.props.disabled) {
      return (
        <input className={classes} type="submit" value={this.props.label} disabled="disabled" />
      );
    } else {
      return (
        <input className={classes} type="submit" value={this.props.label} />
      );
    }
  },
});