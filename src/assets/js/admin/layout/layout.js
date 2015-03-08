var React = require('react'),
  Router = require('react-router'),
  Link = Router.Link;

module.exports = React.createClass({
  _buildAdminMenu: function(addListClasses) {
    return (
      <div className={addListClasses ? 'ui inverted relaxed divided list' : ''}>
        <Link to="home" className="item">Dashboard</Link>
        <Link to="routes" className="item">Routes</Link>
      </div>
    );
  },

  render: function() {
    var AdminMenuTop = this._buildAdminMenu(false),
      AdminMenuPage = this._buildAdminMenu(true);

    return (
      <div {...this.props}>
        <nav id="admin_popout_menu" className="ui vertical inverted sidebar menu left">
          {AdminMenuTop}
        </nav>
        <div className="ui grid">
          <div id="admin_menu" className="three wide column">
            <nav className="ui inverted segment">
              {AdminMenuPage}
            </nav>
          </div>
          <div id="admin_content" className="thirteen wide column">
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
});

