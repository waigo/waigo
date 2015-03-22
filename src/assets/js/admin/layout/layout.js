var React = require('react'),
  Router = require('react-router'),
  Link = Router.Link;

module.exports = React.createClass({
  _buildAdminMenu: function(addListClasses) {
    return (
      <ul className="nav nav-pills nav-stacked">
        <li role="presentation"><Link to="home">Dashboard</Link></li>
        <li role="presentation"><Link to="routes">Routes</Link></li>
        <li role="presentation"><Link to="models">Data</Link></li>
      </ul>
    );
  },

  render: function() {
    var AdminMenuTop = this._buildAdminMenu(false),
      AdminMenuPage = this._buildAdminMenu(true);

    return (
      <div {...this.props}>
        <div className="row">
          <div id="admin_menu" className="col-md-3">
            <nav>
              {AdminMenuPage}
            </nav>
          </div>
          <div id="admin_content" className="col-md-9">
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
});

