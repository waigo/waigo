var React = require('react');
var Router = require('react-router');



module.exports = React.createClass({
  propTypes: {
    onLabel: React.PropTypes.string,
    offLabel: React.PropTypes.string,
    onChange : React.PropTypes.func,
    initiallyOn: React.PropTypes.bool,
  },

  getDefaultProps: function() {
    return {
      onLabel: 'On',
      offLabel: 'Off',
      onChange: null,
      initiallyOn: false,
    };
  },

  render: function() {
    if (this.props.initiallyOn) {
      var input = <input type="checkbox" onChange={this._onChange} checked />;
    } else {
      var input = <input type="checkbox" onChange={this._onChange} />;
    }

    return (
      <div className="switch">
        <label>
          <span>{this.props.offLabel}</span>
          {input}
          <span className="lever"></span>
          <span>{this.props.onLabel}</span>
        </label>
      </div>
    );
  },


  _onChange: function(e) {
    if (this.props.onChange) {
      this.props.onChange(e.currentTarget.checked);
    }
  },

});

