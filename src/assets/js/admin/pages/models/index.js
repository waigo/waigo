var React = require('react');

var Router = require('react-router'),
  Link = Router.Link;

var RenderUtils = require('../../utils/renderUtils');


module.exports = React.createClass({
  getInitialState: function() {
    return {
      models: [],
      filter: '',
      loaded: false,
      error: null,
    };
  },


  _onFilterChange: function(e) {
    this.setState({
      filter: $(e.target).val()
    });
  },

  _buildModelsList: function() {
    if (this.state.loaded) {
      var models = [];

      // 'one of these' --> ['one', 'of', 'these']
      var filter = this.state.filter.toLowerCase().split(' ');

      var models = this.state.models.filter(function(r) {
        // ensure every filter keyword is matched
        for (var i=0; i<filter.length; ++i) {
          if (0 > r.key.indexOf(filter[i])) {
            return false;
          }
        }

        return true;
        
      }).map(function(r) {
        var rParams = {
          key: encodeURIComponent(r.key)
        };

        return (
          <li className="list-group-item" key={r.key}>
            <Link to='model' params={rParams} className="item">
              {r.name}
            </Link>
          </li>
        );
      });


      return (
        <div>
          <div className="form-group">
            <input 
              className="form-control"
              type="text" 
              onChange={this._onFilterChange}
              onKeyUp={this._onFilterChange}
              onKeyDown={this._onFilterChange}
              placeholder="Filter..." />
          </div>
          <ul className="list-group">{models}</ul>
        </div>
      );
    } else {
      return (
        <div className="loading">Loading...</div>
      )
    }
  },


  render: function() { 
    return (
      <div className="page-models">
        {RenderUtils.buildError(this.state.error)}
        {this._buildModelsList()}
      </div>
    );
  },


  componentDidMount: function() {
    var self = this;

    $.getJSON('/admin/models?format=json')
      .done(function(data){        
        if (self.isMounted()) {
          self.setState({
            routes: data.routes.map(function(r) {
              r.key = r.name.toLowerCase()

              return r;
            })
          });
        }
      })
      .fail(function(xhr, status, errMsg) {
        self.setState({
          error: errMsg
        });
      })
      .always(function() {
        self.setState({
          loaded: true
        });
      })
    ;
  },
});
