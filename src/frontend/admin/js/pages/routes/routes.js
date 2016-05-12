var React = require('react');

var FilterList = require('../../components/filterList'),
  RenderUtils = require('../../utils/renderUtils');


module.exports = React.createClass({

  render: function() { 
    return (
      <div className="page-routes">
        <FilterList
          ajaxUrl='/admin/routes?format=json'
          ajaxResponseDataMapper={this._mapAjaxData}
          itemDisplayNameFormatter={this._getItemDisplayName} />
      </div>
    );
  },

  _mapAjaxData: function(data) {
    data = data || {};

    return (data.routes || []).map(function(r) {
      // GET /example/path  -- >  get/example/path
      r.key = r.method.toLowerCase() + r.url.toLowerCase();

      r.routePath = encodeURIComponent(r.key);

      return r;
    });
  },


  _getItemDisplayName: function(item) {
    return (
      <span>
        <span className="method">{item.method.toUpperCase()}</span>
        <span className="url">{item.url}</span>
      </span>
    );
  },


});
