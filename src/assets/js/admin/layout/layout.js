var React = require('react'),
  Router = require('react-router'),
  Link = Router.Link;

module.exports = React.createClass({
  render: function() {
    var routes = {
      'home': {
        label: 'Dashboard',
      },
      'routes': {
        label: 'Routes',
        subRoutes: ['route'],
      },
      'models': {
        label: 'Data',
        subRoutes: ['model', 'modelRow'],
      }
    };

    var activeRoutes = _(this.props.routes).pluck('name').compact().value();

    var links = _.map(routes, function(meta, routeName) {
      var itemClass = 'collection-item';

      var matchRoutes = [routeName].concat(meta.subRoutes || []);
      if (_.intersection(activeRoutes, matchRoutes).length) {
        itemClass += ' active'
      }

      return (<Link to={routeName} className={itemClass}>{meta.label}</Link>);
    });

    return (
      <div {...this.props} className="row">
        <div id="admin_menu" className="col s2">
          <div className="collection">
            {links}
          </div>
        </div>
        <div id="admin_content" className="col s10">
          {this.props.children}
        </div>
      </div>
    );
  }
});
