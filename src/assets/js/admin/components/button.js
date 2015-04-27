var React = require('react');


module.exports = React.createClass({
  propTypes: {
    className: React.PropTypes.string,
    icon : React.PropTypes.string,
    label : React.PropTypes.string,
    disabled : React.PropTypes.boolean,
    onClick : React.PropTypes.func,
    color : React.PropTypes.string,
  },

  getDefaultProps: function() {
    return {
      className: '',
      icon: null,
      label: 'Submit',
      disabled: false,
      onClick: null,
      color: '',
    };
  },

  _onClick: function(e) {
    if (this.props.onClick) {
      this.props.onClick(e);
    }
  },

  render: function() {
    var classes = 'btn btn-primary waves-effect waves-light' 
      + ' ' + this.props.className
      + ' ' + this.props.color;

    var icon = this.props.icon 
      ? (<i className={"fa fa-" + this.props.icon} />) 
      : null;

    if (this.props.disabled) {
      return (
        <button className={classes} disabled="disabled">
          {icon}
          <span>{this.props.label}</span>
        </button>
      );
    } else {
      return (
        <button className={classes} onClick={this._onClick}>
          {icon}
          <span>{this.props.label}</span>
        </button>
      );
    }
  }
  
});