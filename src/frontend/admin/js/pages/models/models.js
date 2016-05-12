var React = require('react');

var Router = require('react-router'),
  Link = Router.Link;

var FilterList = require('../../components/filterList'),
  RenderUtils = require('../../utils/renderUtils');


module.exports = React.createClass({
  render: function() { 
    return (
      <div className="page-models">
        <FilterList
          ajaxUrl='/admin/models?format=json'
          ajaxResponseDataMapper={this._mapAjaxData}
          itemDisplayNameFormatter={this._getItemDisplayName} />
      </div>
    );
  },

  _mapAjaxData: function(data) {
    data = data || {};

    return (data.models || []).map(function(r) {
      return {
        key: r,
        name: r,
        routePath: encodeURIComponent(r),
      };
    });
  },


  _getItemDisplayName: function(item) {
    return (
      <span>{item.name}</span>
    );
  },


});
