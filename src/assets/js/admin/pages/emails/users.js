var React = require('react');

var ModelTable = require('../../components/modelTable');


module.exports = React.createClass({
  propTypes: {
    users: React.PropTypes.array,
    addUser: React.PropTypes.func,
  },

  getDefaultProps: function() {
    return {
      users: [],
      addUser: null,
    };
  },

  onRowClick: function(user) {
    if (this.props.addUser) {
      this.props.addUser(user);
    }
  },

  render: function() { 
    var columns = [
      {
        name: 'username'      
      }
    ];

    var users = this.props.users.map(function(user){
      return (
        <li className="collection-item">{user.username}</li>
      );
    });

    return (
      <div className="row">
        <div className="col s12 m5">
          <ModelTable
            modelName="User"
            columns={columns}
            excludeRows={this.props.users}
            onRowClick={this.onRowClick} />
        </div>
        <div className="col s12 m6 offset-m1">
          <h2>Selected users:</h2>
          <ul className="collection">
            {users}
          </ul>          
        </div>        
      </div>
    );
  }


});
