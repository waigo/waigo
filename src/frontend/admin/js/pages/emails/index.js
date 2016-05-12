var React = require('react');
const ReactDOM = require('react-dom');

var _ = require('lodash');

var UsersPage = require('./users');
var SendPage = require('./send');


exports.init = function(rootElem) {

  var App = React.createClass({
    getInitialState: function() {
      return {
        users: [],
        template: '',
      };
    },
    addUser: function(user) {
      var existing = _.find(this.state.users, function(u) {
        return u.id === user.id;
      });

      if (!existing) {
        this.setState({
          users: this.state.users.concat([user])
        });
      }
    },
    removeUser: function(userOrId) {
      if (userOrId.id) {
        userOrId = userOrId.id;
      }

      var newUsers = this.state.users.filter(function(u) {
        return u.id !== userOrId;
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
              <li className="tab col s3"><a href="#send"><span class="badge">2.</span> Send</a></li>
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
            <div id="send" className="col s12">
              <SendPage 
                users={this.state.users} />
            </div>
          </section>
        </div>
      )
    }
  });

  
  ReactDOM.render(<App />, rootElem);
};


