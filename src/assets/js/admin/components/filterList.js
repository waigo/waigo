var React = require('react');
var Router = require('react-router');
var Link = Router.Link;

var Loader = require('./loader'),
  RenderUtils = require('../utils/renderUtils'),  
  GuardedStateMixin = require('../mixins/guardedState');



module.exports = React.createClass({
  mixins: [GuardedStateMixin],


  getInitialState: function() {
    return {
      items: [],
      filter: '',
      loading: true,
      error: null,
    };
  },


  _onFilterChange: function(e) {
    this.setState({
      filter: $(e.target).val()
    });
  },


  _buildItemList: function() {
    var self = this;

    if (this.state.loaded) {
      // 'one of these' --> ['one', 'of', 'these']
      var filter = this.state.filter.toLowerCase().split(' ');

      var items = this.state.items.filter(function(item) {
        // ensure every filter keyword is matched
        for (var i=0; i<filter.length; ++i) {
          if (0 > item.key.indexOf(filter[i])) {
            return false;
          }
        }

        return true;
        
      }).map(function(item) {
        var rParams = {
          key: encodeURIComponent(item.key)
        };

        var itemDisplay = self.props.itemDisplayNameFormatter(item);

        return (
          <li className="collection-item" key={item.key}>
            <Link to={self.props.itemRoute} params={rParams} className="item">
              {itemDisplay}
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
          <ul className="collection">{items}</ul>
        </div>
      );
    } else {
      return (
        <Loader />
      )
    }
  },


  render: function() {
    return (
      <div className="collection-filter">
        {RenderUtils.buildError(this.state.error)}
        {this._buildItemList()}
      </div>
    );
  },


  componentDidMount: function() {
    var self = this;

    self.setState({
      loaded: false
    });

    $.getJSON(self.props.ajaxUrl)
      .done(function(data){        
        self.setStateIfMounted({
          items: self.props.ajaxResponseDataMapper(data)
        });
      })
      .fail(function(xhr) {
        self.setStateIfMounted({
          error: xhr
        });
      })
      .always(function() {
        self.setStateIfMounted({
          loaded: true
        });
      })
    ;
  },

});

