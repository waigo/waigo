var React = require('react');

var UsersPage = require('./users');
var TemplatePage = require('./templates');
var SendPage = require('./send');


var App = React.createClass({
  getInitialState: function() {
    return {
      users: [],
      template: '',
    };
  },
  setUsers: function(users) {
    this.setState({
      users: users
    });
  },
  setTemplate: function(users) {
    this.setState({
      template: template
    });
  },
  render () {
    return (
      <div className="row page-emails">
        <div className="col s12">
          <ul className="tabs">
            <li className="tab col s3"><a className="active" href="#users"><span class="badge">1.</span> Select users</a></li>
            <li className="tab col s3"><a href="#templates"><span class="badge">2.</span> Select template</a></li>
            <li className="tab col s3"><a href="#send"><span class="badge">3.</span> Send</a></li>
          </ul>
        </div>
        <section className="tab-content">
          <div id="users" className="col s12">
            <UsersPage {...this.props} />
          </div>
          <div id="templates" className="col s12">
            <TemplatePage {...this.props} />
          </div>
          <div id="send" className="col s12">
            <SendPage {...this.props} />
          </div>
        </section>
      </div>
    )
  }
});


React.render(<App />, document.getElementById('react-root'));

