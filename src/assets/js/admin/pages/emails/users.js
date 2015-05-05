var React = require('react');

var ModelTable = require('../../components/modelTable');


module.exports = React.createClass({

  onRowClick: function(user) {
    console.log(user);
  },

  render: function() { 
    var columns = [
      {
        name: 'username'      
      }
    ];

    return (
      <div className="row">
        <div className="col s12 m5">
          <ModelTable
            modelName="User"
            columns={columns}
            onRowClick={this.onRowClick} />
        </div>
        <div className="col s12 m6 offset-m1">
          <h2>Selected users:</h2>
          <ul className="collection">
            <li className="collection-item">Alvin</li>
            <li className="collection-item">Alvin</li>
            <li className="collection-item">Alvin</li>
            <li className="collection-item">Alvin</li>
          </ul>          
        </div>        
      </div>
    );
  }


});
