var React = require('react');


module.exports = React.createClass({
  propTypes: {
    text : React.PropTypes.string,
  },

  getDefaultProps: function() {
    return {
      text: 'Loading',
    };
  },

  render: function() {
    return (
      <div className="loader">
        <div className="preloader-wrapper big active">
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
  