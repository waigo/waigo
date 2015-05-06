var React = require('react');

var Button = require('../../components/button');


module.exports = React.createClass({
  propTypes: {
    users: React.PropTypes.array,
  },

  getDefaultProps: function() {
    return {
      users: [],
    };
  },

  render: function() { 
    var sendBtnLabel = `Send to ${this.props.users.length} users`;

    var content = "";

    if (!this.props.users.length) {
      content = (
        <strong>Please select some users first.</strong>
      )
    } else {
      content = (
        <div>
          <div className="row">
            <div className="col m6 s12">
              editor
            </div>
            <div className="col m6 m-offset1 s12">
              preview
            </div>          
          </div>
          <Button label={sendBtnLabel} />
        </div>
      );
    }

    return (
      <div className="content-send">
        {content}
      </div>
    );
  }

});
