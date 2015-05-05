var React = require('react');

var _ = require('../../utils/lodash');

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
  addUser: function(user) {
    var existing = _.find(this.state.users, function(u) {
      return u._id === user._id;
    });

    if (!existing) {
      this.setState({
        users: this.state.users.concat([user])
      });
    }
  },
  removeUser: function(user) {
    var newUsers = _.find(this.state.users, function(u) {
      return u._id !== user._id;
    });

    this.setState({
      users: newUsers
    });
  },
  clearUsers: function() {
    this.setState({
      users: []
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
            <UsersPage 
              users={this.state.users} 
              addUser={this.addUser} 
              removeUser={this.removeUser}
              clearUsers={this.clearUsers} />
          </div>
          <div id="templates" className="col s12">
            <TemplatePage />
          </div>
          <div id="send" className="col s12">
            <SendPage />
          </div>
        </section>
      </div>
    )
  }
});


React.render(<App />, document.getElementById('react-root'));

