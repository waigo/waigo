var React = require('react');

var Button = require('../../components/button');
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
    this.props.addUser(user);
  },

  render: function() { 
    var self = this;

    var columns = [
      {
        name: 'username'      
      }
    ];

    var users = (<em>None selected</em>);

    if (this.props.users.length) {
      users = this.props.users.map(function(user){
        return (
          <li className="collection-item">
            {user.username}
            <a href="#!" className="secondary-content" 
                data-id={user.id} onClick={self._onRemoveUser}>
              <i className="fa fa-remove"></i>
            </a>
          </li>
        );
      });

      users = (
        <div>
          <Button label="Clear all" size="small" onClick={this._onClear} />
          <ul className="collection">{users}</ul>
        </div>
      );
    }

    return (
      <div className="row">
        <div className="col s12 m5">
          <ModelTable
            modelName="User"
            columns={columns}
            excludeRows={this.props.users}
            onRowClick={this.onRowClick} />
        </div>
        <div className="col s12 m6 offset-m1 selected-users">
          <h2>Selected users:</h2>
          {users}
        </div>        
      </div>
    );
  },


  _onRemoveUser: function(e) {
    e.preventDefault();

    this.props.removeUser(e.currentTarget.dataset.id);
  },


  _onClear: function() {
    this.props.clearUsers();
  },

});
