var React = require('react');


module.exports = React.createClass({
  propTypes: {
    text : React.PropTypes.string,
    inline: React.PropTypes.bool,
    size: React.PropTypes.string,
  },

  getDefaultProps: function() {
    return {
      text: 'Loading',
      inline: false,
      size: 'big',
    };
  },

  render: function() {
    var classes = 'loader ' + 
      (this.props.inline ? 'inline' : '');

    var wrapperClasses = 'preloader-wrapper active ' + this.props.size;

    return (
      <div className={classes}>
        <div className={wrapperClasses}>
          <div className="spinner-layer spinner-blue-only">
            <div className="circle-clipper left">
              <div className="circle"></div>
            </div>
          </div>
        </div>
      </div>
    );
  },
});
  