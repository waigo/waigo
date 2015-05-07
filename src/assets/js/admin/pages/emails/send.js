var React = require('react');

var Timer = require('clockmaker').Timer;

var RenderUtils = require('../../utils/renderUtils'),
  GuardedStateMixin = require('../../mixins/guardedState');

var Button = require('../../components/button'),
  Loader = require("../../components/loader"),
  TextEditor = require('../../components/textEditor');


module.exports = React.createClass({
  mixins: [GuardedStateMixin],

  getInitialState: function() {
    return {
      template: '',
      rendered: '',
      loading: false,
      error: null,
    };
  },

  propTypes: {
    users: React.PropTypes.array,
  },

  getDefaultProps: function() {
    return {
      users: [],
    };
  },

  render: function() { 
    var numUsers = this.props.users.length;

    if (!numUsers) {
      return (
        <em>Please select some users to send to.</em>
      );
    }

    var sendBtnLabel = `Send to ${numUsers} ${1 == numUsers ? 'user' : 'users'}`;

    var bracketsSyntax = '{{...}}';

    var tips = (
      <p className="tips">
        NOTE: All app-level locals as well 
        as <code>recipient</code> are available as template variables. 
        Use <code>{bracketsSyntax}</code> syntax to insert.
      </p>
    );

    var loadingAnim = null;

    if (this.state.loading) {
      loadingAnim = (<Loader size="small" inline={true} />);
    }

    return (
      <div className="content-send">
        {tips}
        <div className="row">
          <div className="col m6 s12">
            <h2>Markdown</h2>
            <TextEditor height="400px" onChange={this._onTemplateUpdate} />
          </div>
          <div className="col m6 m-offset1 s12">
            <h2>
              <span>Preview</span>
              {loadingAnim}
            </h2>
            {RenderUtils.buildError(this.state.error)}
            <div className="preview"
              dangerouslySetInnerHTML={{__html: this.state.rendered}} />
          </div>          
        </div>
        <Button label={sendBtnLabel} />
      </div>
    );
  },


  _onTemplateUpdate: function(text) {
    this.setState({
      template: text
    });

    this._fetchPreview();
  },


  _fetchPreview: function() {
    var self = this;

    // if not users don't fetch
    if (!this.props.users.length) {
      return;
    }

    // give time for multiple successive template changes to take place
    if (self._fetchPreviewTimer) {
      self._fetchPreviewTimer.stop();
    }

    self._fetchPreviewTimer = Timer(function() {

      self.setState({
        loading: true,
        error: null,
      });

      // fetch collection rows
      $.ajax({
        url: '/admin/emails/render?format=json',
        method: 'POST',
        data: {
          template: self.state.template,
          user: self.props.users[0]._id
        }
      })
        .done(function(data){        
          self.setStateIfMounted({
            rendered: data.html,
          });
        })
        .fail(function(xhr) {
          self.setStateIfMounted({
            error: xhr
          });
        })
        .always(function() {
          self.setStateIfMounted({
            loading: false,
          });
        })
      ;

    }, 300).start();
  },

});
