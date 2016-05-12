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
      subject: '',
      body: '',
      subjectPreview: '',
      bodyPreview: '',
      loading: false,
      sending: false,
      error: null,
      sendError: null,
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
      <form className="content-send">
        {tips}
        <div className="row">
          <div className="col m6 s12 fields">
            <h2>Markdown</h2>
            <input type="text" 
                className="subject" 
                onKeyUp={this._onSubjectChange} 
                placeholder="Subject"
                ref="subject" />
            <TextEditor height="400px" 
                onChange={this._onBodyChange} 
                ref="body" />
          </div>
          <div className="col m6 m-offset1 s12 preview">
            <h2>
              <span>Preview</span>
              {loadingAnim}
            </h2>
            {RenderUtils.buildError(this.state.error)}
            <input type="text" readonly value={this.state.subjectPreview} placeholder="Subject preview..." />
            <div className="body"
              dangerouslySetInnerHTML={{__html: this.state.bodyPreview}} />
          </div>          
        </div>
        {this._buildSendButton()}
      </form>
    );
  },


  _buildSendButton: function() {
    var numUsers = this.props.users.length;

    var sendButton = null,
      sendAnim = null,
      sendBtnLabel = `Send to ${numUsers} ${1 == numUsers ? 'user' : 'users'}`;

    if (this.state.sending) {
      sendButton = (<Button label={sendBtnLabel} disabled />);
      sendAnim = (<Loader inline={true} />);
    } else {
      sendButton = <Button label={sendBtnLabel} onClick={this._onSend} />;
    }

    return (
      <div className="send-info">
        {sendButton}
        <div className="send-result">
          {sendAnim}
          {RenderUtils.buildError(this.state.sendError)}
        </div>
      </div>
    );
  },


  _onSubjectChange: function(e) {
    this.setState({
      subject: e.currentTarget.value
    });

    this._fetchPreview();
  },


  _onBodyChange: function(text) {
    this.setState({
      body: text
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
          subject: self.state.subject,
          body: self.state.body,
          user: self.props.users[0].id
        }
      })
        .done(function(data){        
          self.setStateIfMounted({
            subjectPreview: data.subject || '',
            bodyPreview: data.body || '',
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



  _onSend: function() {
    var self = this;

    // if not users don't fetch
    if (!this.props.users.length) {
      return;
    }

    this.setState({
      sending: true,
      sendError: null,
    });

    // fetch collection rows
    $.ajax({
      url: '/admin/emails/send?format=json',
      method: 'POST',
      data: {
        subject: self.state.subject,
        body: self.state.body,
        users: self.props.users.map( v => v.id ),
      }
    })
      .done(function() {
        Materialize.toast('Email succesfully sent', 2000, 'rounded');

        // clear inputs
        self.refs.body.clear();
        self.refs.subject.value = '';

        self.setStateIfMounted({
          subject: '',
          body: '',
          subjectPreview: '',
          bodyPreview: '',
        });
      })
      .fail(function(xhr) {
        self.setStateIfMounted({
          sendError: xhr
        });
      })
      .always(function() {
        self.setStateIfMounted({
          sending: false,
        });
      })
    ;
  },
});
